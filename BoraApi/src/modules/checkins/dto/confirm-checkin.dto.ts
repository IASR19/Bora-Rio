import { IsString, IsUUID } from 'class-validator';

export class ConfirmCheckinDto {
  @IsUUID()
  eventId: string;

  @IsString()
  qrToken: string;

  @IsString()
  deviceId: string;
}
