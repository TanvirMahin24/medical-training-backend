import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscriptionPlanResponseDto,
} from '../dto/subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private prisma: PrismaService) {}

  async createPlan(
    createDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    // Check if a plan with the same name already exists
    const existingPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: createDto.name },
    });

    if (existingPlan) {
      throw new Error(
        `A subscription plan with the name "${createDto.name}" already exists. Please choose a different name.`,
      );
    }

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: createDto.name,
        tagline: createDto.tagline,
        price: createDto.price,
        currency: createDto.currency,
        duration: createDto.duration,
        keyFeatures: createDto.keyFeatures,
        casesPerMonth: createDto.casesPerMonth,
        simulationsPerMonth: createDto.simulationsPerMonth,
        practiceTests: createDto.practiceTests,
        certificates: createDto.certificates,
        prioritySupport: createDto.prioritySupport,
        offlineAccess: createDto.offlineAccess,
        customCases: createDto.customCases,
        popular: createDto.popular || false,
        recommended: createDto.recommended || false,
        isActive: true,
      },
    });

    return this.mapToResponseDto(plan);
  }

  async getAllPlans(): Promise<SubscriptionPlanResponseDto[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return plans.map((plan) => this.mapToResponseDto(plan));
  }

  async getExistingPlanNames(): Promise<string[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      select: { name: true },
      where: { isActive: true },
    });

    return plans.map((plan) => plan.name);
  }

  async getPlanById(id: string): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    return this.mapToResponseDto(plan);
  }

  async updatePlan(
    id: string,
    updateDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new Error('Subscription plan not found');
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.tagline !== undefined && { tagline: updateDto.tagline }),
        ...(updateDto.price !== undefined && { price: updateDto.price }),
        ...(updateDto.currency !== undefined && {
          currency: updateDto.currency,
        }),
        ...(updateDto.duration !== undefined && {
          duration: updateDto.duration,
        }),
        ...(updateDto.keyFeatures !== undefined && {
          keyFeatures: updateDto.keyFeatures,
        }),
        ...(updateDto.casesPerMonth !== undefined && {
          casesPerMonth: updateDto.casesPerMonth,
        }),
        ...(updateDto.simulationsPerMonth !== undefined && {
          simulationsPerMonth: updateDto.simulationsPerMonth,
        }),
        ...(updateDto.practiceTests !== undefined && {
          practiceTests: updateDto.practiceTests,
        }),
        ...(updateDto.certificates !== undefined && {
          certificates: updateDto.certificates,
        }),
        ...(updateDto.prioritySupport !== undefined && {
          prioritySupport: updateDto.prioritySupport,
        }),
        ...(updateDto.offlineAccess !== undefined && {
          offlineAccess: updateDto.offlineAccess,
        }),
        ...(updateDto.customCases !== undefined && {
          customCases: updateDto.customCases,
        }),
        ...(updateDto.popular !== undefined && { popular: updateDto.popular }),
        ...(updateDto.recommended !== undefined && {
          recommended: updateDto.recommended,
        }),
      },
    });

    return this.mapToResponseDto(updatedPlan);
  }

  async deletePlan(id: string): Promise<void> {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new Error('Subscription plan not found');
    }

    // Check if any users are currently on this plan
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        subscriptionPlanId: existingPlan.id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    // Soft delete by setting isActive to false
    await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async togglePlanStatus(id: string): Promise<SubscriptionPlanResponseDto> {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new Error('Subscription plan not found');
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: !existingPlan.isActive },
    });

    return this.mapToResponseDto(updatedPlan);
  }

  private mapToResponseDto(plan: any): SubscriptionPlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      tagline: plan.tagline,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      keyFeatures: plan.keyFeatures,
      limits: {
        casesPerMonth: plan.casesPerMonth,
        simulationsPerMonth: plan.simulationsPerMonth,
        practiceTests: plan.practiceTests,
        certificates: plan.certificates,
        prioritySupport: plan.prioritySupport,
        offlineAccess: plan.offlineAccess,
        customCases: plan.customCases,
      },
      popular: plan.popular,
      recommended: plan.recommended,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
