import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { RegisterDto } from '../auth/dto/auth.dto';
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

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
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
