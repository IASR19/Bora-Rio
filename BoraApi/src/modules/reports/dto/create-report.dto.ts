import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ReportCategory, ReportTargetType } from '../entities/report.entity';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsUUID()
  targetId: string;

  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsOptional()
  @IsString()
  message?: string;
}
