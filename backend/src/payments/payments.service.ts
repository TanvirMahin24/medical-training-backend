import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(
    userId: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        metadata: {
          userId,
        },
      });

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      this.logger.log(`Stripe customer created for user ${userId}`);
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe customer for user ${userId}:`,
        error,
      );
      throw new BadRequestException('Failed to create customer account');
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId?: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get the subscription plan
      const subscriptionPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId, isActive: true },
      });

      if (!subscriptionPlan) {
        this.logger.error(`Subscription plan not found for ID: ${planId}`);
        throw new BadRequestException('Subscription plan not found');
      }

      this.logger.log(
        `Found subscription plan: ${subscriptionPlan.name}, Stripe Price ID: ${subscriptionPlan.stripePriceId}, Stripe Active: ${subscriptionPlan.stripeActive}`,
      );

      if (!subscriptionPlan.stripePriceId || !subscriptionPlan.stripeActive) {
        this.logger.error(
          `Subscription plan ${subscriptionPlan.name} is not properly configured for Stripe. Price ID: ${subscriptionPlan.stripePriceId}, Active: ${subscriptionPlan.stripeActive}`,
        );
        throw new BadRequestException(
          'Subscription plan is not configured for Stripe payments. Please contact support.',
        );
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        this.logger.log(`Creating new Stripe customer for user ${userId}`);
        const customer = await this.createCustomer(
          userId,
          user.email,
          user.firstName || undefined,
          user.lastName || undefined,
        );
        customerId = customer.id;
        this.logger.log(`Created Stripe customer: ${customerId}`);
      } else {
        this.logger.log(`Using existing Stripe customer: ${customerId}`);
      }

      // Create subscription using the plan's Stripe price ID
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: subscriptionPlan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: 14,
        // Disable automatic tax for now since customer address is required
        // automatic_tax: { enabled: true },
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      this.logger.log(`Creating Stripe subscription with data:`, {
        customerId,
        priceId: subscriptionPlan.stripePriceId,
        planName: subscriptionPlan.name,
        paymentMethodId: paymentMethodId || 'none',
      });

      const subscription =
        await this.stripe.subscriptions.create(subscriptionData);

      // Save subscription to database
      const dbSubscription = await this.prisma.subscription.create({
        data: {
          userId,
          subscriptionPlanId: subscriptionPlan.id,
          stripeSubscriptionId: subscription.id,
          planType: subscriptionPlan.name.toLowerCase(),
          status: this.mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });

      // Update user subscription status
      await this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'ACTIVE' },
      });

      this.logger.log(
        `Subscription created for user ${userId}: ${subscription.id}`,
      );
      return { subscription, dbSubscription };
    } catch (error) {
      this.logger.error(
        `Failed to create subscription for user ${userId}:`,
        error,
      );

      // Provide more specific error messages
      if (error.message?.includes("customer's location isn't recognized")) {
        throw new BadRequestException(
          'Customer address required for tax calculation. Please update your profile with a valid address.',
        );
      }

      if (error.message?.includes('Subscription plan not found')) {
        throw new BadRequestException(
          'Selected subscription plan is not available',
        );
      }

      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId, stripeSubscriptionId: subscriptionId },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      // Cancel in Stripe
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
      });

      this.logger.log(
        `Subscription ${subscriptionId} canceled for user ${userId}`,
      );
      return {
        message:
          'Subscription will be canceled at the end of the current period',
      };
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId}:`,
        error,
      );
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'usd',
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(
          userId,
          user.email,
          user.firstName || undefined,
          user.lastName || undefined,
        );
        customerId = customer.id;
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata: {
          userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment intent to database
      await this.prisma.payment.create({
        data: {
          userId,
          stripePaymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: 'PENDING',
        },
      });

      this.logger.log(
        `Payment intent created for user ${userId}: ${paymentIntent.id}`,
      );

      // Return client secret for frontend confirmation
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent for user ${userId}:`,
        error,
      );
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook ${event.type}:`, error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
        include: { user: true },
      });

      if (subscription) {
        // Update subscription status
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: new Date(invoice.period_start * 1000),
            currentPeriodEnd: new Date(invoice.period_end * 1000),
          },
        });

        // Update user status
        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: { subscriptionStatus: 'ACTIVE' },
        });

        // Send confirmation email
        if (subscription.user.firstName) {
          await this.emailService.sendSubscriptionConfirmation(
            subscription.user.email,
            subscription.user.firstName,
            subscription.planType,
          );
        }
      }
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });

      if (subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        });

        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: { subscriptionStatus: 'PAST_DUE' },
        });
      }
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      await this.prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: this.mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      await this.prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'CANCELLED',
          endedAt: new Date(),
        },
      });

      await this.prisma.user.update({
        where: { id: dbSubscription.userId },
        data: { subscriptionStatus: 'EXPIRED' },
      });
    }
  }

  private getPlanTypeFromPriceId(priceId: string): string {
    // This should be configured based on your Stripe price IDs
    if (priceId.includes('basic')) return 'basic';
    if (priceId.includes('premium')) return 'premium';
    if (priceId.includes('enterprise')) return 'enterprise';
    return 'basic';
  }

  private mapStripeStatus(
    stripeStatus: string,
  ): 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE' | 'UNPAID' {
    switch (stripeStatus) {
      case 'active':
        return 'ACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
        return 'CANCELLED';
      case 'unpaid':
        return 'UNPAID';
      case 'trialing':
        return 'TRIAL';
      default:
        return 'ACTIVE';
    }
  }

  async getSubscriptionPlans() {
    try {
      // Get subscription plans from database instead of Stripe
      const plans = await this.prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
        select: {
          id: true,
          name: true,
          tagline: true,
          price: true,
          currency: true,
          duration: true,
          keyFeatures: true,
          casesPerMonth: true,
          simulationsPerMonth: true,
          practiceTests: true,
          certificates: true,
          prioritySupport: true,
          offlineAccess: true,
          customCases: true,
          popular: true,
          recommended: true,
          stripeActive: true,
        },
      });

      return plans;
    } catch (error) {
      this.logger.error('Failed to fetch subscription plans:', error);
      throw new BadRequestException('Failed to fetch subscription plans');
    }
  }
}
