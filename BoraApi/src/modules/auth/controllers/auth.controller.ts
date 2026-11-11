import { Body, Controller, Patch, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ADMIN_REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { clearAdminRefreshTokenCookie, clearRefreshTokenCookie, setRefreshTokenCookie } from '../auth.cookies';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import {
  ChangePasswordDto,
  ConfirmEmailVerificationDto,
  GoogleLoginDto,
  LoginDto,
  RegisterBusinessDto,
  RegisterDto,
} from '../dto/auth.dto';
import { assertNotImpersonating } from '../impersonation';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../types/jwt-payload.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /** Emite os tokens (refresh no cookie) e devolve o usuário no mesmo formato do GET /users/me. */
  private async signIn(user: User, res: Response) {
    const tokens = this.authService.issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);
    // Entrar de novo encerra qualquer acesso de suporte que tenha ficado aberto neste navegador.
    clearAdminRefreshTokenCookie(res);
    return { user: await this.usersService.withBusinessVenue(user), accessToken: tokens.accessToken };
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.signIn(await this.authService.register(dto), res);
  }

  /** Cadastro de conta de comércio: fica em análise até o admin aprovar. */
  @Public()
  @Post('register/business')
  async registerBusiness(@Body() dto: RegisterBusinessDto, @Res({ passthrough: true }) res: Response) {
    return this.signIn(await this.authService.registerBusiness(dto), res);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.signIn(await this.authService.validateCredentials(dto), res);
  }

  @Public()
  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.signIn(await this.authService.loginWithGoogle(dto.idToken, dto.language, dto.createAccount), res);
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.authService.refreshTokens(refreshToken);
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearRefreshTokenCookie(res);
    clearAdminRefreshTokenCookie(res);
    return { success: true };
  }

  /** Encerra o acesso de suporte e devolve o admin para a própria conta. */
  @Public()
  @Post('impersonation/stop')
  async stopImpersonation(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const adminRefreshToken = req.cookies?.[ADMIN_REFRESH_TOKEN_COOKIE];
    if (!adminRefreshToken) throw new UnauthorizedException('Missing admin session');

    clearAdminRefreshTokenCookie(res);
    const { user, accessToken, refreshToken } = await this.authService
      .stopImpersonation(adminRefreshToken, req.cookies?.[REFRESH_TOKEN_COOKIE])
      .catch(() => {
        // Sessão do admin vencida ou revogada: não sobra sessão nenhuma, o app pede login.
        clearRefreshTokenCookie(res);
        throw new UnauthorizedException('Admin session expired');
      });
    setRefreshTokenCookie(res, refreshToken);
    return { user: await this.usersService.withBusinessVenue(user), accessToken };
  }

  @Patch('password')
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: JwtPayload) {
    assertNotImpersonating(user);
    await this.authService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
    return { success: true };
  }

  /** Envia o código de confirmação ao e-mail da conta logada. */
  @Post('verification/email/request')
  async requestEmailVerification(@CurrentUser() user: JwtPayload) {
    // O código vai para o e-mail do dono da conta: o suporte não deve disparar isso por ele.
    assertNotImpersonating(user);
    const { code, ...result } = await this.authService.requestEmailVerification(user.sub);
    // Sem Resend em dev/teste, o código volta na resposta para dar pra testar o fluxo.
    const isDev = process.env.NODE_ENV !== 'production';
    return { ...result, ...(isDev && code ? { devCode: code } : {}) };
  }

  @Post('verification/email/confirm')
  async confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto, @CurrentUser() user: JwtPayload) {
    assertNotImpersonating(user);
    await this.authService.confirmEmailVerification(user.sub, dto.code);
    return { verified: true };
  }
}
