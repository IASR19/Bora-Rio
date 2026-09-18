import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { VERIFICATION_CODE_TTL_MINUTES } from '../auth.constants';
import {
  EmailAlreadyRegisteredException,
  GoogleLoginNotConfiguredException,
  InvalidCredentialsException,
  InvalidGoogleTokenException,
  InvalidVerificationCodeException,
} from '../auth-errors';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { PhoneVerification } from '../entities/phone-verification.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PhoneVerification)
    private readonly verificationRepository: Repository<PhoneVerification>,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyRegisteredException();

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({ ...dto, passwordHash });
  }

  async validateCredentials(dto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.passwordHash) throw new InvalidCredentialsException();

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsException();

    return user;
  }

  issueTokens(user: User): TokenPair {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });
    return { accessToken, refreshToken };
  }

  refreshTokens(refreshToken: string): TokenPair {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
      },
    );
    const newRefreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );
    return { accessToken, refreshToken: newRefreshToken };
  }

  async loginWithGoogle(idToken: string): Promise<User> {
    const audience = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!audience) throw new GoogleLoginNotConfiguredException();

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      throw new InvalidGoogleTokenException();
    }

    if (!payload?.email || !payload.sub) throw new InvalidGoogleTokenException();
    if (payload.email_verified === false) throw new InvalidGoogleTokenException();

    const existingByGoogleId = await this.usersService.findByGoogleId(payload.sub);
    if (existingByGoogleId) return existingByGoogleId;

    const existingByEmail = await this.usersService.findByEmail(payload.email);
    if (existingByEmail) {
      await this.usersService.linkGoogleId(existingByEmail.id, payload.sub);
      return this.usersService.findById(existingByEmail.id);
    }

    return this.usersService.createFromGoogle({
      name: payload.name ?? payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      avatarUrl: payload.picture,
    });
  }

  async requestPhoneVerification(phone: string): Promise<string> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000);
    await this.verificationRepository.save(this.verificationRepository.create({ phone, code, expiresAt }));
    // TODO: integrar provedor de SMS (ex.: Twilio/Zenvia) — por ora o código fica disponível
    // apenas via log/retorno em ambiente de desenvolvimento.
    return code;
  }

  async confirmPhoneVerification(phone: string, code: string): Promise<void> {
    const verification = await this.verificationRepository.findOne({
      where: { phone, code, consumed: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification || verification.expiresAt.getTime() < Date.now()) {
      throw new InvalidVerificationCodeException();
    }

    verification.consumed = true;
    await this.verificationRepository.save(verification);
    await this.usersService.markPhoneVerified(phone);
  }
}
