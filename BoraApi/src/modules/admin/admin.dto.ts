import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export const REGIONS: Record<string, string[]> = {
  Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
};

export class AdminQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsIn(Object.keys(REGIONS))
  region?: string;

  @IsOptional()
  @IsIn(Object.values(REGIONS).flat())
  state?: string;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsIn(['pending_review', 'published', 'rejected'])
  status?: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';

  @IsOptional()
  @IsIn(['true', 'false'])
  active?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  business?: string;
}

export class AdminUpdateUserDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(2, 120)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  showInWhoIsGoing?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['pt', 'es', 'en'])
  language?: 'pt' | 'es' | 'en';
}

export class AdminReviewDto {
  @IsIn(['approved', 'rejected'])
  decision: 'approved' | 'rejected';

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(3, 1000)
  note: string;
}
