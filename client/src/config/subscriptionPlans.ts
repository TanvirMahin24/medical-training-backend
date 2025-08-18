export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  duration: number; // in days
  keyFeatures: string[]; // Only 3-4 key features
  limits: {
    casesPerMonth: number;
    simulationsPerMonth: number;
    practiceTests: number;
    certificates: number;
    prioritySupport: boolean;
    offlineAccess: boolean;
    customCases: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "trial",
    name: "Free Trial",
    tagline: "Get started with basic features",
    price: 0,
    currency: "USD",
    duration: 7,
    keyFeatures: ["3 basic cases", "2 simulations/month", "Basic tracking"],
    limits: {
      casesPerMonth: 3,
      simulationsPerMonth: 2,
      practiceTests: 1,
      certificates: 0,
      prioritySupport: false,
      offlineAccess: false,
      customCases: false,
    },
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "Perfect for students",
    price: 19.99,
    currency: "USD",
    duration: 30,
    keyFeatures: [
      "15 cases/month",
      "10 simulations/month",
      "Progress analytics",
      "Email support",
    ],
    limits: {
      casesPerMonth: 15,
      simulationsPerMonth: 10,
      practiceTests: 5,
      certificates: 2,
      prioritySupport: false,
      offlineAccess: false,
      customCases: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Advanced features for professionals",
    price: 39.99,
    currency: "USD",
    duration: 30,
    keyFeatures: [
      "50+ cases/month",
      "Unlimited simulations",
      "Advanced analytics",
      "Priority support",
    ],
    limits: {
      casesPerMonth: 50,
      simulationsPerMonth: -1, // unlimited
      practiceTests: -1, // unlimited
      certificates: 10,
      prioritySupport: true,
      offlineAccess: true,
      customCases: true,
    },
    popular: true,
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Complete solution for teams",
    price: 99.99,
    currency: "USD",
    duration: 30,
    keyFeatures: [
      "Unlimited everything",
      "Team management",
      "Custom branding",
      "Dedicated support",
    ],
    limits: {
      casesPerMonth: -1, // unlimited
      simulationsPerMonth: -1, // unlimited
      practiceTests: -1, // unlimited
      certificates: -1, // unlimited
      prioritySupport: true,
      offlineAccess: true,
      customCases: true,
    },
  },
];

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};

export const getCurrentUserPlan = (
  subscriptionStatus: string
): SubscriptionPlan => {
  switch (subscriptionStatus) {
    case "ACTIVE":
      return SUBSCRIPTION_PLANS[2]; // Premium by default for active users
    case "TRIAL":
      return SUBSCRIPTION_PLANS[0];
    case "EXPIRED":
      return SUBSCRIPTION_PLANS[0];
    default:
      return SUBSCRIPTION_PLANS[0];
  }
};

export const getUpgradeOptions = (
  currentPlanId: string
): SubscriptionPlan[] => {
  const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(
    (plan) => plan.id === currentPlanId
  );
  if (currentPlanIndex === -1) return SUBSCRIPTION_PLANS.slice(1); // All paid plans if current plan not found

  return SUBSCRIPTION_PLANS.slice(currentPlanIndex + 1); // Only plans above current
};

export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  if (price === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatDuration = (days: number): string => {
  if (days === 30) return "month";
  if (days === 365) return "year";
  if (days === 7) return "week";
  return `${days} days`;
};
