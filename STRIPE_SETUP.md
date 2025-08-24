# Stripe Integration Setup Guide

This guide will help you set up Stripe payments in your medical training platform.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Access to your Stripe Dashboard
3. Node.js and npm installed

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your backend `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Get Your Stripe Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Use the test keys for development (they start with `pk_test_` and `sk_test_`)

### 3. Create Subscription Plans in Stripe

1. Go to **Products** in your Stripe Dashboard
2. Create three products:
   - **Basic Plan** (e.g., "Medical Training Basic")
   - **Premium Plan** (e.g., "Medical Training Premium")
   - **Enterprise Plan** (e.g., "Medical Training Enterprise")

3. For each product, create a recurring price:
   - Set billing to **Recurring**
   - Choose **Monthly** billing
   - Set your desired prices
   - Copy the **Price ID** (starts with `price_`)

### 4. Set Up Webhooks

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/payments/webhooks/stripe`
4. Select these events to listen for:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Frontend Setup

### 1. Environment Variables

Create a `.env` file in your `client` directory:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
REACT_APP_STRIPE_BASIC_PRICE_ID=price_basic_monthly_id_here
REACT_APP_STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_id_here
REACT_APP_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id_here

# API Configuration
REACT_APP_API_URL=http://localhost:4005/api
```

### 2. Update Price IDs

Replace the placeholder price IDs in `client/src/config/stripe.ts` with your actual Stripe price IDs.

## Testing

### 1. Test Card Numbers

Use these test card numbers in Stripe test mode:

- **Visa**: `4242 4242 4242 4242`
- **Visa (declined)**: `4000 0000 0000 0002`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### 2. Test Scenarios

1. **Successful Payment**: Use `4242 4242 4242 4242`
2. **Failed Payment**: Use `4000 0000 0000 0002`
3. **3D Secure**: Use `4000 0025 0000 3155`

## Production Deployment

### 1. Switch to Live Keys

When deploying to production:

1. Replace test keys with live keys in your environment variables
2. Update webhook endpoints to your production domain
3. Test thoroughly with small amounts first

### 2. Security Considerations

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Enable webhook signature verification
- Implement proper error handling
- Monitor webhook failures

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL matches exactly
   - Verify webhook is active in Stripe Dashboard

2. **Payment intent creation failed**
   - Verify `STRIPE_SECRET_KEY` is correct
   - Check that the amount is in cents (smallest currency unit)
   - Ensure customer creation is successful

3. **Frontend payment form not loading**
   - Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set
   - Verify Stripe.js is loading properly
   - Check browser console for errors

### Debug Mode

Enable Stripe debug mode by setting:

```bash
STRIPE_DEBUG=true
```

This will log detailed information about API calls and webhooks.

## API Endpoints

### Backend Payment Endpoints

- `POST /api/payments/subscriptions` - Create subscription
- `POST /api/payments/payment-intents` - Create payment intent
- `POST /api/payments/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/payments/plans` - Get available plans

### Frontend Components

- `PaymentForm` - Individual payment form
- `SubscriptionCheckout` - Complete subscription flow
- `SubscriptionUpgradeModal` - Plan selection and upgrade

## Support

For additional help:

1. Check [Stripe Documentation](https://stripe.com/docs)
2. Review [Stripe API Reference](https://stripe.com/docs/api)
3. Check application logs for detailed error messages
4. Verify all environment variables are set correctly

## Security Notes

- All payments are processed securely through Stripe
- No credit card data is stored on your servers
- Webhook signatures are verified to prevent tampering
- PCI DSS compliance is handled by Stripe
- Use HTTPS in production for all webhook endpoints
