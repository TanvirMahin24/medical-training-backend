import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class SyncPlanToStripeDto {
  @ApiProperty({ description: 'ID of the subscription plan to sync' })
  @IsString()
  planId: string;
}

export class DeactivateStripePlanDto {
  @ApiProperty({ description: 'ID of the subscription plan to deactivate' })
  @IsString()
  planId: string;
}

export class StripePlanStatusResponseDto {
  @ApiProperty()
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    isActive: boolean;
    stripeProductId?: string;
    stripePriceId?: string;
    stripeActive: boolean;
  };

  @ApiProperty()
  stripeStatus: {
    synced: boolean;
    productId?: string;
    priceId?: string;
    active: boolean;
    error?: string;
  };
}

export class SyncAllPlansResponseDto {
  @ApiProperty()
  results: Array<{
    planId: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
}
