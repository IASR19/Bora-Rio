import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CommonErrorCodes } from '../../common/constants/error-codes';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { isUniqueViolation } from '../../common/utils/database.utils';
import { isValidCpf } from '../../shared/helpers/document.helper';
import { RegisterDto } from '../auth/dto/auth.dto';
import { Venue } from '../venues/entities/venue.entity';
import { SubmitIdentityDto } from './dto/submit-identity.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

/** Resposta do GET/PATCH /users/me: o usuário + o local da conta de comércio (null pra `user`). */
export type UserMe = User & { businessVenueId: string | null };

export const cpfTakenException = () =>
  new BusinessException('Esse CPF já está associado a outra conta', CommonErrorCodes.DUPLICATED_RESOURCE);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Venue) private readonly venuesRepository: Repository<Venue>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /** E-mail já usado por alguma conta, inclusive excluída: o índice único de users.email vale
   * pra todas, então o cadastro precisa dar o erro certo antes de tentar o insert. */
  isEmailTaken(email: string): Promise<boolean> {
    return this.usersRepository.exists({ where: { email }, withDeleted: true });
  }

  /** Inclui o passwordHash (coluna `select: false`): só pra conferir senha. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { googleId });
  }

  createFromGoogle(data: {
    name: string;
    email: string;
    googleId: string;
    avatarUrl?: string | null;
    language?: 'pt' | 'es' | 'en';
  }): Promise<User> {
    // Conta de usuário pelo Google; o comércio pelo Google passa por `AuthService.registerBusiness`.
    const user = this.usersRepository.create({
      accountType: 'user',
      name: data.name,
      email: data.email,
      googleId: data.googleId,
      language: data.language ?? 'pt',
      avatarUrl: data.avatarUrl ?? null,
      phone: null,
      emailVerified: true,
      passwordHash: null,
      birthDate: null,
    });
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new ResourceNotFoundException('User', id);
    return user;
  }

  /** Acrescenta `businessVenueId` (local da conta de comércio) ao usuário. */
  async withBusinessVenue(user: User): Promise<UserMe> {
    const venue =
      user.accountType === 'business'
        ? await this.venuesRepository.findOne({ where: { ownerUserId: user.id }, select: { id: true } })
        : null;
    return Object.assign(user, { businessVenueId: venue?.id ?? null });
  }

  async findMe(id: string): Promise<UserMe> {
    return this.withBusinessVenue(await this.findById(id));
  }

  /**
   * Marca a resposta com o admin que está acessando a conta em modo suporte (ou `null`),
   * para o app mostrar o aviso e o "voltar para minha conta".
   */
  async withImpersonation<T extends object>(view: T, impersonatorId?: string) {
    const admin = impersonatorId
      ? await this.usersRepository.findOne({ where: { id: impersonatorId }, select: { id: true, name: true } })
      : null;
    return Object.assign(view, { impersonation: admin ? { adminId: admin.id, adminName: admin.name } : null });
  }

  /** CPF só com dígitos e dígito verificador válido. */
  normalizeCpf(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (!isValidCpf(digits)) throw new BusinessException('CPF inválido');
    return digits;
  }

  /** Uma conta por CPF (índice único; aqui só pra dar erro claro antes do save). Conta excluída
   * continua segurando o CPF, porque o índice também vale pra ela. */
  async assertCpfAvailable(cpf: string, exceptUserId?: string): Promise<void> {
    const taken = await this.usersRepository.exists({
      where: exceptUserId ? { cpf, id: Not(exceptUserId) } : { cpf },
      withDeleted: true,
    });
    if (taken) throw cpfTakenException();
  }

  /** Cadastro por e-mail de conta `user`. O CPF já chega normalizado e conferido (AuthService.register). */
  async create(data: RegisterDto & { passwordHash: string }): Promise<User> {
    const user = this.usersRepository.create({
      accountType: 'user',
      cpf: data.cpf,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      language: data.language ?? 'pt',
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl ?? null,
    });
    const saved = await this.usersRepository.save(user);
    // Recarrega sem o passwordHash, que o save devolveria na resposta do cadastro.
    return this.findById(saved.id);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { emailVerified: true });
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { passwordHash });
  }

  async delete(userId: string): Promise<void> {
    await this.usersRepository.softDelete({ id: userId });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserMe> {
    const user = await this.findById(id);
    const { cpf, ...changes } = dto;

    // Conta de comércio não tem nascimento/gênero (é o estabelecimento, não uma pessoa).
    if (user.accountType === 'business') {
      delete changes.birthDate;
      delete changes.gender;
    }

    // CPF: quem entrou pelo Google (ou conta antiga) informa uma vez; depois não muda.
    // `null` vale como ausente (o CPF não pode ser apagado).
    if (cpf != null) {
      if (user.accountType === 'business') throw new BusinessException('Conta de comércio não tem CPF.');
      const digits = this.normalizeCpf(cpf);
      if (user.cpf && user.cpf !== digits) throw new BusinessException('O CPF não pode ser alterado.');
      if (!user.cpf) {
        await this.assertCpfAvailable(digits, user.id);
        user.cpf = digits;
      }
    }

    Object.assign(user, changes);
    try {
      return this.withBusinessVenue(await this.usersRepository.save(user));
    } catch (err) {
      if (isUniqueViolation(err)) throw cpfTakenException();
      throw err;
    }
  }

  /** Identidade da pessoa (CPF + selfie). Só conta `user`: conta de comércio se identifica pelo CNPJ. */
  async submitIdentity(userId: string, dto: SubmitIdentityDto): Promise<User> {
    const user = await this.findById(userId);
    if (user.accountType === 'business') throw new BusinessException('Conta de comércio não tem CPF.');

    const digits = this.normalizeCpf(dto.cpf);
    if (user.cpf && user.cpf !== digits) throw new BusinessException('O CPF não pode ser alterado.');
    await this.assertCpfAvailable(digits, userId);

    user.cpf = digits;
    user.selfieUrl = dto.selfieUrl;
    try {
      return await this.usersRepository.save(user);
    } catch (err) {
      // Corrida: duas contas enviando o mesmo CPF quase ao mesmo tempo — o
      // índice único pega o que o findOne acima não pegou a tempo.
      if (isUniqueViolation(err)) throw cpfTakenException();
      throw err;
    }
  }

  getPublicProfile(user: User) {
    return {
      id: user.id,
      name: user.name.split(' ')[0],
      avatarUrl: user.avatarUrl,
      city: user.city,
    };
  }
}
