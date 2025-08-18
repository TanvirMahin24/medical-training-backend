import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Reason for cancellation (optional)',
    required: false,
    example: 'Too expensive',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
