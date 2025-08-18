import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscriptionPlanResponseDto,
} from '../dto/subscription-plan.dto';

@Controller('admin/subscription-plans')
@UseGuards(JwtAuthGuard)
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Get()
  async getAllPlans(): Promise<{ plans: SubscriptionPlanResponseDto[] }> {
    const plans = await this.subscriptionPlanService.getAllPlans();
    return { plans };
  }

  @Get('names')
  async getExistingPlanNames(): Promise<{ names: string[] }> {
    const names = await this.subscriptionPlanService.getExistingPlanNames();
    return { names };
  }

  @Get(':id')
  async getPlanById(
    @Param('id') id: string,
  ): Promise<{ plan: SubscriptionPlanResponseDto }> {
    const plan = await this.subscriptionPlanService.getPlanById(id);
    return { plan };
  }

  @Post()
  async createPlan(
    @Body() createDto: CreateSubscriptionPlanDto,
  ): Promise<{ plan: SubscriptionPlanResponseDto; message: string }> {
    const plan = await this.subscriptionPlanService.createPlan(createDto);
    return {
      plan,
      message: 'Subscription plan created successfully',
    };
  }

  @Put(':id')
  async updatePlan(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionPlanDto,
  ): Promise<{ plan: SubscriptionPlanResponseDto; message: string }> {
    const plan = await this.subscriptionPlanService.updatePlan(id, updateDto);
    return {
      plan,
      message: 'Subscription plan updated successfully',
    };
  }

  @Delete(':id')
  async deletePlan(@Param('id') id: string): Promise<{ message: string }> {
    await this.subscriptionPlanService.deletePlan(id);
    return { message: 'Subscription plan deleted successfully' };
  }

  @Post(':id/toggle-status')
  async togglePlanStatus(
    @Param('id') id: string,
  ): Promise<{ plan: SubscriptionPlanResponseDto; message: string }> {
    const plan = await this.subscriptionPlanService.togglePlanStatus(id);
    const status = plan.isActive ? 'activated' : 'deactivated';
    return {
      plan,
      message: `Subscription plan ${status} successfully`,
    };
  }
}
