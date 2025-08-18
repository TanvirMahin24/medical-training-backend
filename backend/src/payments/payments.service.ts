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
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
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
    priceId: string,
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

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(
          userId,
          user.email,
          user.firstName,
          user.lastName,
        );
        customerId = customer.id;
      }

      // Create subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: 14,
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription =
        await this.stripe.subscriptions.create(subscriptionData);

      // Save subscription to database
      const dbSubscription = await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: subscription.id,
          planType: this.getPlanTypeFromPriceId(priceId),
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
          user.firstName,
          user.lastName,
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
      return paymentIntent;
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

  private mapStripeStatus(stripeStatus: string): string {
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
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      return prices.data.map((price) => ({
        id: price.id,
        product: price.product as Stripe.Product,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch subscription plans:', error);
      throw new BadRequestException('Failed to fetch subscription plans');
    }
  }
}
