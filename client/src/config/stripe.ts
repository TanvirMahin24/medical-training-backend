// Stripe configuration
export const STRIPE_CONFIG = {
  // These should match your Stripe dashboard price IDs
  PRICE_IDS: {
    BASIC: process.env.REACT_APP_STRIPE_BASIC_PRICE_ID || "price_basic_monthly",
    PREMIUM:
      process.env.REACT_APP_STRIPE_PREMIUM_PRICE_ID || "price_premium_monthly",
    ENTERPRISE:
      process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID ||
      "price_enterprise_monthly",
  },
  // Stripe publishable key
  PUBLISHABLE_KEY:
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_your_publishable_key",
  // Currency
  CURRENCY: "usd",
  // Supported payment methods
  PAYMENT_METHODS: ["card", "sepa_debit"],
};

// Plan mapping to Stripe price IDs
export const PLAN_TO_PRICE_ID = {
  basic: STRIPE_CONFIG.PRICE_IDS.BASIC,
  premium: STRIPE_CONFIG.PRICE_IDS.PREMIUM,
  enterprise: STRIPE_CONFIG.PRICE_IDS.ENTERPRISE,
};

// Stripe Elements appearance
export const STRIPE_ELEMENTS_APPEARANCE = {
  theme: "stripe",
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#ffffff",
    colorText: "#1f2937",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
};
