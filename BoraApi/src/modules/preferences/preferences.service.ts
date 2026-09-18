import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UserPreferences } from './entities/user-preferences.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly repository: Repository<UserPreferences>,
  ) {}

  async findByUserId(userId: string): Promise<UserPreferences> {
    const existing = await this.repository.findOne({ where: { userId } });
    if (existing) return existing;
    return this.repository.save(this.repository.create({ userId }));
  }

  async update(userId: string, dto: UpdatePreferencesDto): Promise<UserPreferences> {
    const preferences = await this.findByUserId(userId);
    Object.assign(preferences, dto);
    return this.repository.save(preferences);
  }
}
