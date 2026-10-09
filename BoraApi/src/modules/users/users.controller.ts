import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BusinessVerificationService } from './business-verification.service';
import { SubmitBusinessVerificationDto } from './dto/submit-business-verification.dto';
import { SubmitIdentityDto } from './dto/submit-identity.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessVerificationService: BusinessVerificationService,
  ) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto);
  }

  @Patch('me/identity')
  submitIdentity(@CurrentUser() user: JwtPayload, @Body() dto: SubmitIdentityDto) {
    return this.usersService.submitIdentity(user.sub, dto);
  }

  /** Primeira criação de evento como ponto comercial: CNPJ + contrato social analisado por IA. */
  @Post('me/business-verification')
  submitBusinessVerification(@CurrentUser() user: JwtPayload, @Body() dto: SubmitBusinessVerificationDto) {
    return this.businessVerificationService.submit(user.sub, dto);
  }

  @Delete('me')
  async deleteMe(@CurrentUser() user: JwtPayload) {
    await this.usersService.delete(user.sub);
    return { success: true };
  }
}
