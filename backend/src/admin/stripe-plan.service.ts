import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripePlanService {
  private readonly logger = new Logger(StripePlanService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createStripeProduct(planData: {
    name: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const product = await this.stripe.products.create({
        name: planData.name,
        description: planData.description,
        metadata: planData.metadata,
      });

      this.logger.log(`Stripe product created: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to create Stripe product:', error);
      throw new BadRequestException('Failed to create Stripe product');
    }
  }

  async createStripePrice(
    productId: string,
    priceData: {
      amount: number;
      currency: string;
      recurring: {
        interval: 'day' | 'week' | 'month' | 'year';
        interval_count?: number;
      };
      metadata?: Record<string, any>;
    },
  ) {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(priceData.amount * 100), // Convert to cents
        currency: priceData.currency.toLowerCase(),
        recurring: priceData.recurring,
        metadata: priceData.metadata,
      });

      this.logger.log(`Stripe price created: ${price.id}`);
      return price;
    } catch (error) {
      this.logger.error('Failed to create Stripe price:', error);
      throw new BadRequestException('Failed to create Stripe price');
    }
  }

  async syncPlanToStripe(planId: string) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Create or update Stripe product
      let stripeProductId = plan.stripeProductId;
      if (!stripeProductId) {
        const product = await this.createStripeProduct({
          name: plan.name,
          description: plan.tagline,
          metadata: {
            planId: plan.id,
            casesPerMonth: plan.casesPerMonth,
            simulationsPerMonth: plan.simulationsPerMonth,
            practiceTests: plan.practiceTests,
            certificates: plan.certificates,
          },
        });
        stripeProductId = product.id;
      }

      // Create or update Stripe price
      let stripePriceId = plan.stripePriceId;
      if (!stripePriceId) {
        const price = await this.createStripePrice(stripeProductId, {
          amount: plan.price,
          currency: plan.currency,
          recurring: {
            interval: 'month',
            interval_count: Math.ceil(plan.duration / 30),
          },
          metadata: {
            planId: plan.id,
            planType: plan.name.toLowerCase(),
          },
        });
        stripePriceId = price.id;
      }

      // Update plan with Stripe IDs
      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          stripeProductId,
          stripePriceId,
          stripeActive: true,
        },
      });

      this.logger.log(`Plan ${plan.name} synced to Stripe successfully`);
      return updatedPlan;
    } catch (error) {
      this.logger.error(`Failed to sync plan ${planId} to Stripe:`, error);
      throw error;
    }
  }

  async deactivateStripePlan(planId: string) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      if (plan.stripePriceId) {
        // Archive the Stripe price (can't delete active prices)
        await this.stripe.prices.update(plan.stripePriceId, {
          active: false,
        });
      }

      // Update plan to mark Stripe as inactive
      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          stripeActive: false,
        },
      });

      this.logger.log(`Plan ${plan.name} Stripe integration deactivated`);
      return updatedPlan;
    } catch (error) {
      this.logger.error(
        `Failed to deactivate Stripe for plan ${planId}:`,
        error,
      );
      throw error;
    }
  }

  async getStripePlanStatus(planId: string) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      let stripeStatus: {
        synced: boolean;
        productId: string | null;
        priceId: string | null;
        active: boolean;
        error: string | null;
      } = {
        synced: false,
        productId: null,
        priceId: null,
        active: false,
        error: null,
      };

      if (plan.stripeProductId && plan.stripePriceId) {
        try {
          // Verify both product and price exist in Stripe
          const [product, price] = await Promise.all([
            this.stripe.products.retrieve(plan.stripeProductId),
            this.stripe.prices.retrieve(plan.stripePriceId),
          ]);

          stripeStatus = {
            synced: true,
            productId: plan.stripeProductId,
            priceId: plan.stripePriceId,
            active: plan.stripeActive && product.active && price.active,
            error: null,
          };
        } catch (stripeError) {
          stripeStatus.error = 'Stripe product/price not found or inactive';
        }
      }

      return {
        plan,
        stripeStatus,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get Stripe status for plan ${planId}:`,
        error,
      );
      throw error;
    }
  }

  async syncAllPlansToStripe() {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany({
        where: { isActive: true },
      });

      const results: Array<{
        planId: string;
        success: boolean;
        result?: any;
        error?: string;
      }> = [];

      for (const plan of plans) {
        try {
          const result = await this.syncPlanToStripe(plan.id);
          results.push({ planId: plan.id, success: true, result });
        } catch (error) {
          results.push({
            planId: plan.id,
            success: false,
            error: error.message,
          });
        }
      }

      this.logger.log(`Synced ${plans.length} plans to Stripe`);
      return results;
    } catch (error) {
      this.logger.error('Failed to sync all plans to Stripe:', error);
      throw error;
    }
  }
}
