import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from '../auth.cookies';
import { Public } from '../decorators/public.decorator';
import {
  ConfirmVerificationDto,
  GoogleLoginDto,
  LoginDto,
  RegisterDto,
  RequestVerificationDto,
} from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    const tokens = this.authService.issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateCredentials(dto);
    const tokens = this.authService.issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.loginWithGoogle(dto.idToken);
    const tokens = this.authService.issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokens = this.authService.refreshTokens(refreshToken);
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearRefreshTokenCookie(res);
    return { success: true };
  }

  @Public()
  @Post('verification/request')
  async requestVerification(@Body() dto: RequestVerificationDto) {
    const code = await this.authService.requestPhoneVerification(dto.phone);
    const isDev = process.env.NODE_ENV !== 'production';
    return { sent: true, ...(isDev ? { devCode: code } : {}) };
  }

  @Public()
  @Post('verification/confirm')
  async confirmVerification(@Body() dto: ConfirmVerificationDto) {
    await this.authService.confirmPhoneVerification(dto.phone, dto.code);
    return { verified: true };
  }
}
