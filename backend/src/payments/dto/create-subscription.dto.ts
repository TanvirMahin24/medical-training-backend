import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID of the subscription plan from the database',
    example: 'uuid-of-subscription-plan',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'Stripe payment method ID (optional)',
    required: false,
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
