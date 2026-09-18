import { IsUUID } from 'class-validator';

export class SubmitInterestDto {
  @IsUUID()
  toUserId: string;
}
