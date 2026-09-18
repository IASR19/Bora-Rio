import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommonErrorCodes } from '../../common/constants/error-codes';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { isUniqueViolation } from '../../common/utils/database.utils';
import { isValidCpf } from '../../shared/helpers/document.helper';
import { RegisterDto } from '../auth/dto/auth.dto';
import { SubmitIdentityDto } from './dto/submit-identity.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { googleId });
  }

  createFromGoogle(data: { name: string; email: string; googleId: string; avatarUrl?: string | null }): Promise<User> {
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl ?? null,
      phone: null,
      phoneVerified: false,
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

  create(data: RegisterDto & { passwordHash: string }): Promise<User> {
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl ?? null,
    });
    return this.usersRepository.save(user);
  }

  async markPhoneVerified(phone: string): Promise<void> {
    await this.usersRepository.update({ phone }, { phoneVerified: true });
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { passwordHash });
  }

  async delete(userId: string): Promise<void> {
    await this.usersRepository.softDelete({ id: userId });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.usersRepository.findOne({ where: { phone: dto.phone } });
      if (existing) throw new BusinessException('Telefone já está em uso', CommonErrorCodes.DUPLICATED_RESOURCE);
      user.phoneVerified = false;
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  /** Telefone confirmado + CPF válido + selfie liberam publicar evento na hora,
   * mesmo em local ainda não verificado (ver EventsService.create). */
  async submitIdentity(userId: string, dto: SubmitIdentityDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user.phoneVerified) {
      throw new BusinessException('Verifique seu telefone antes de enviar sua identidade');
    }

    const digits = dto.cpf.replace(/\D/g, '');
    if (!isValidCpf(digits)) {
      throw new BusinessException('CPF inválido');
    }

    const existing = await this.usersRepository.findOne({ where: { cpf: digits } });
    if (existing && existing.id !== userId) {
      throw new BusinessException('Esse CPF já está associado a outra conta', CommonErrorCodes.DUPLICATED_RESOURCE);
    }

    user.cpf = digits;
    user.selfieUrl = dto.selfieUrl;
    try {
      return await this.usersRepository.save(user);
    } catch (err) {
      // Corrida: duas contas enviando o mesmo CPF quase ao mesmo tempo — o
      // índice único pega o que o findOne acima não pegou a tempo.
      if (isUniqueViolation(err)) {
        throw new BusinessException('Esse CPF já está associado a outra conta', CommonErrorCodes.DUPLICATED_RESOURCE);
      }
      throw err;
    }
  }

  /** Perfil completo o bastante pra usar o app: idade, telefone e localização
   * são necessários pro BORA Score (restrição de idade, distância) funcionar. */
  isProfileComplete(user: User): boolean {
    return Boolean(user.birthDate && user.phone && user.city);
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
