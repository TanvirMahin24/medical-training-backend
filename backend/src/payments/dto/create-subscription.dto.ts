import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Stripe price ID for the subscription plan',
    example: 'price_1234567890',
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    description: 'Stripe payment method ID (optional)',
    required: false,
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
