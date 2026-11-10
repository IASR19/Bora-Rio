import { randomInt } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { DataSource, Repository } from 'typeorm';

import { BusinessException } from '../../../common/exceptions/business.exception';
import { isUniqueViolation } from '../../../common/utils/database.utils';
import { MailService } from '../../../shared/services/mail.service';
import {
  BUSINESS_PENDING_NOTE,
  BusinessVerificationService,
  cnpjTakenException,
} from '../../users/business-verification.service';
import { BusinessVerificationStatus, User } from '../../users/entities/user.entity';
import { cpfTakenException, UsersService } from '../../users/users.service';
import { VenuesService } from '../../venues/venues.service';
import { EMAIL_CODE_COOLDOWN_SECONDS, EMAIL_CODE_MAX_ATTEMPTS, VERIFICATION_CODE_TTL_MINUTES } from '../auth.constants';
import {
  EmailAlreadyRegisteredException,
  GoogleAccountNotFoundException,
  GoogleLoginNotConfiguredException,
  InvalidCredentialsException,
  InvalidGoogleTokenException,
  InvalidVerificationCodeException,
  NoPasswordSetException,
} from '../auth-errors';
import { LoginDto, RegisterBusinessDto, RegisterDto } from '../dto/auth.dto';
import { EmailVerification } from '../entities/email-verification.entity';
import { buildVerificationEmail } from '../verification-email';

interface GoogleIdentity {
  email: string;
  googleId: string;
  name?: string;
  picture?: string;
}

export interface EmailVerificationRequest {
  sent: boolean;
  /** Segundos até poder pedir outro código (0 quando a conta já está verificada). */
  retryInSeconds: number;
  /** Só para o controller devolver fora de produção. */
  code?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly usersService: UsersService,
    private readonly businessVerificationService: BusinessVerificationService,
    private readonly venuesService: VenuesService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
  ) {}

  /** Cadastro de conta `user`. CPF obrigatório, válido e único (uma conta por pessoa). */
  async register(dto: RegisterDto): Promise<User> {
    if (await this.usersService.isEmailTaken(dto.email)) throw new EmailAlreadyRegisteredException();

    const cpf = this.usersService.normalizeCpf(dto.cpf);
    await this.usersService.assertCpfAvailable(cpf);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.usersService.create({ ...dto, cpf, passwordHash });
    } catch (err) {
      // Corrida entre dois cadastros: o índice único pega o que as checagens acima não pegaram.
      if (isUniqueViolation(err)) throw await this.duplicatedAccountException(dto.email, cpfTakenException());
      throw err;
    }
  }

  /**
   * Cadastro de conta de comércio. Primeiro as checagens baratas (e-mail livre, CNPJ válido e
   * livre, arquivo do contrato), só depois a consulta à Receita e o parecer pago da IA; então cria,
   * numa transação só, a conta (`business`, em análise) e o local dela (não verificado, invisível
   * até o admin aprovar). A IA só deixa nota pro admin: quem aprova é sempre ele. Consulta à
   * Receita fora do ar não bloqueia (vai com nota pra revisão manual); CNPJ inexistente bloqueia.
   */
  async registerBusiness(dto: RegisterBusinessDto): Promise<User> {
    // Pelo Google, o e-mail vem do token verificado (nunca do corpo) e a conta fica sem senha.
    const google = dto.googleIdToken ? await this.verifyGoogleToken(dto.googleIdToken) : null;
    const email = google?.email ?? dto.email!;
    if (await this.usersService.isEmailTaken(email)) throw new EmailAlreadyRegisteredException();
    if (google && (await this.usersService.findByGoogleId(google.googleId))) throw new EmailAlreadyRegisteredException();

    const cnpj = this.businessVerificationService.normalizeCnpj(dto.cnpj);
    await this.businessVerificationService.assertCnpjAvailable(cnpj);
    // `review` confere o arquivo antes de qualquer consulta externa.
    const { company, decision } = await this.businessVerificationService.review(cnpj, dto.contractFile);

    const passwordHash = google ? null : await bcrypt.hash(dto.password!, 10);
    let userId: string;
    try {
      userId = await this.dataSource.transaction(async (manager) => {
        const user = await manager.save(
          manager.create(User, {
            accountType: 'business',
            name: dto.name,
            email,
            googleId: google?.googleId ?? null,
            avatarUrl: google?.picture ?? null,
            emailVerified: Boolean(google),
            phone: dto.phone,
            language: dto.language ?? 'pt',
            passwordHash,
            city: dto.venue.city ?? null,
            businessCnpj: cnpj,
            businessName: company?.legalName || dto.venue.name,
            businessVerificationStatus: BusinessVerificationStatus.PENDING,
            businessVerificationNote: BUSINESS_PENDING_NOTE,
            businessAiNote: decision.note,
            businessContractFile: dto.contractFile,
            businessVerifiedAt: null,
          }),
        );
        await this.venuesService.createForBusiness(dto.venue, { ownerUserId: user.id, cnpj }, manager);
        return user.id;
      });
    } catch (err) {
      if (isUniqueViolation(err))
        throw await this.duplicatedAccountException(email, cnpjTakenException());
      throw err;
    }
    // Recarrega sem passwordHash, contrato social nem parecer da IA (colunas `select: false`).
    return this.usersService.findById(userId);
  }

  /** Violação de índice único no cadastro: e-mail (se já existe, inclusive em conta excluída)
   * ou o documento (CPF/CNPJ). */
  private async duplicatedAccountException(
    email: string,
    documentTaken: BusinessException,
  ): Promise<BusinessException> {
    return (await this.usersService.isEmailTaken(email))
      ? new EmailAlreadyRegisteredException()
      : documentTaken;
  }

  async validateCredentials(dto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user?.passwordHash) throw new InvalidCredentialsException();

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsException();

    // Devolve o usuário sem o passwordHash (vai na resposta do login).
    return this.usersService.findById(user.id);
  }

  issueTokens(user: User): TokenPair {
    if (!user.isActive) throw new UnauthorizedException('Conta suspensa.');
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '10d') as any,
    });
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    const user = await this.usersService.findById(payload.sub).catch(() => null);
    if (!user?.isActive) throw new UnauthorizedException('Conta suspensa.');
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
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '10d') as any,
      },
    );
    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Entra com Google. Conta já existente (pelo Google ou pelo mesmo e-mail) sempre entra.
   * Sem conta: com `createAccount=false` responde GOOGLE_ACCOUNT_NOT_FOUND, para o app perguntar
   * se a pessoa quer conta de usuário ou de comércio; senão cria conta de usuário.
   */
  async loginWithGoogle(
    idToken: string,
    language: 'pt' | 'es' | 'en' = 'pt',
    createAccount = true,
  ): Promise<User> {
    const google = await this.verifyGoogleToken(idToken);

    // O Google só entrega e-mail confirmado (`verifyGoogleToken`), então a conta fica com o e-mail verificado.
    const existingByGoogleId = await this.usersService.findByGoogleId(google.googleId);
    if (existingByGoogleId) {
      if (existingByGoogleId.emailVerified) return existingByGoogleId;
      await this.usersService.markEmailVerified(existingByGoogleId.id);
      return this.usersService.findById(existingByGoogleId.id);
    }

    const existingByEmail = await this.usersService.findByEmail(google.email);
    if (existingByEmail) {
      await this.usersService.linkGoogleId(existingByEmail.id, google.googleId);
      await this.usersService.markEmailVerified(existingByEmail.id);
      return this.usersService.findById(existingByEmail.id);
    }

    if (!createAccount) throw new GoogleAccountNotFoundException();

    return this.usersService.createFromGoogle({
      language,
      name: google.name ?? google.email.split('@')[0],
      email: google.email,
      googleId: google.googleId,
      avatarUrl: google.picture,
    });
  }

  private async verifyGoogleToken(idToken: string): Promise<GoogleIdentity> {
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
    return { email: payload.email, googleId: payload.sub, name: payload.name, picture: payload.picture };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user?.passwordHash) throw new NoPasswordSetException();

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsException();

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPasswordHash(userId, newHash);
  }

  /**
   * Envia um código de 6 dígitos ao e-mail da conta logada. Pedido repetido dentro de
   * `EMAIL_CODE_COOLDOWN_SECONDS` não reenvia: devolve quanto falta (o app mostra a contagem).
   * A trava na linha do usuário serializa pedidos simultâneos (ex.: dois cliques, StrictMode).
   */
  async requestEmailVerification(userId: string): Promise<EmailVerificationRequest> {
    const pending = await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      if (!user) throw new UnauthorizedException();
      if (user.emailVerified) return { kind: 'wait' as const, retryInSeconds: 0 };

      const repository = manager.getRepository(EmailVerification);
      const last = await repository.findOne({ where: { userId, consumed: false }, order: { createdAt: 'DESC' } });
      const elapsedMs = last ? Date.now() - last.createdAt.getTime() : Infinity;
      if (elapsedMs < EMAIL_CODE_COOLDOWN_SECONDS * 1000) {
        return { kind: 'wait' as const, retryInSeconds: Math.ceil(EMAIL_CODE_COOLDOWN_SECONDS - elapsedMs / 1000) };
      }

      // Só o código mais novo vale.
      await repository.update({ userId, consumed: false }, { consumed: true });
      const code = randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000);
      const verification = await repository.save(repository.create({ userId, code, expiresAt }));
      return { kind: 'send' as const, user, code, verificationId: verification.id };
    });

    if (pending.kind === 'wait') return { sent: false, retryInSeconds: pending.retryInSeconds };

    try {
      await this.mailService.send(
        buildVerificationEmail(pending.user.email, pending.user.name, pending.code, pending.user.language),
      );
    } catch (err) {
      // Envio falhou: apaga o código para não travar o "reenviar" pela espera.
      await this.verificationRepository.delete({ id: pending.verificationId });
      throw err;
    }
    return { sent: true, retryInSeconds: EMAIL_CODE_COOLDOWN_SECONDS, code: pending.code };
  }

  /** Confere o código mais recente da conta. Erros contam tentativa; no limite, o código é invalidado. */
  async confirmEmailVerification(userId: string, code: string): Promise<void> {
    // A tentativa errada precisa ser gravada, então a transação devolve o resultado e o erro é lançado depois.
    const confirmed = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(EmailVerification);
      const verification = await repository.findOne({
        where: { userId, consumed: false },
        order: { createdAt: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!verification || verification.expiresAt.getTime() < Date.now()) return false;

      if (verification.code !== code) {
        verification.attempts += 1;
        if (verification.attempts >= EMAIL_CODE_MAX_ATTEMPTS) verification.consumed = true;
        await repository.save(verification);
        return false;
      }

      verification.consumed = true;
      await repository.save(verification);
      await manager.update(User, { id: userId }, { emailVerified: true });
      return true;
    });

    if (!confirmed) throw new InvalidVerificationCodeException();
  }
}
