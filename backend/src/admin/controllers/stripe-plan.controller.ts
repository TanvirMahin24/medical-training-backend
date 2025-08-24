import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { StripePlanService } from '../stripe-plan.service';
import {
  SyncPlanToStripeDto,
  DeactivateStripePlanDto,
  StripePlanStatusResponseDto,
  SyncAllPlansResponseDto,
} from '../dto/stripe-plan.dto';

@ApiTags('admin/stripe-plans')
@Controller('admin/stripe-plans')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StripePlanController {
  constructor(private readonly stripePlanService: StripePlanService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync a subscription plan to Stripe' })
  @ApiResponse({
    status: 201,
    description: 'Plan synced to Stripe successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async syncPlanToStripe(@Body() syncPlanDto: SyncPlanToStripeDto) {
    return this.stripePlanService.syncPlanToStripe(syncPlanDto.planId);
  }

  @Post('deactivate')
  @ApiOperation({ summary: 'Deactivate Stripe integration for a plan' })
  @ApiResponse({
    status: 200,
    description: 'Stripe integration deactivated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async deactivateStripePlan(
    @Body() deactivatePlanDto: DeactivateStripePlanDto,
  ) {
    return this.stripePlanService.deactivateStripePlan(
      deactivatePlanDto.planId,
    );
  }

  @Get('status/:planId')
  @ApiOperation({ summary: 'Get Stripe integration status for a plan' })
  @ApiParam({ name: 'planId', description: 'ID of the subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Stripe status retrieved successfully',
    type: StripePlanStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getStripePlanStatus(@Param('planId') planId: string) {
    return this.stripePlanService.getStripePlanStatus(planId);
  }

  @Post('sync-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync all active subscription plans to Stripe' })
  @ApiResponse({
    status: 200,
    description: 'All plans synced to Stripe',
    type: SyncAllPlansResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncAllPlansToStripe() {
    return this.stripePlanService.syncAllPlansToStripe();
  }

  @Get('stripe/products')
  @ApiOperation({ summary: 'List all Stripe products' })
  @ApiResponse({
    status: 200,
    description: 'Stripe products retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listStripeProducts() {
    const products = await this.stripePlanService['stripe'].products.list({
      active: true,
      limit: 100,
    });
    return products.data;
  }

  @Get('stripe/prices')
  @ApiOperation({ summary: 'List all Stripe prices' })
  @ApiResponse({
    status: 200,
    description: 'Stripe prices retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listStripePrices() {
    const prices = await this.stripePlanService['stripe'].prices.list({
      active: true,
      limit: 100,
      expand: ['data.product'],
    });
    return prices.data;
  }
}
