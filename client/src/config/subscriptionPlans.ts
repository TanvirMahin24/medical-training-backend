export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
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
    description: "Get started with basic features to explore the platform",
    price: 0,
    currency: "USD",
    duration: 7,
    features: [
      "Access to 3 basic medical cases",
      "2 simulation sessions per month",
      "Basic progress tracking",
      "Community support",
    ],
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
    name: "Basic Plan",
    description: "Perfect for medical students and early-career professionals",
    price: 19.99,
    currency: "USD",
    duration: 30,
    features: [
      "Access to 15 medical cases",
      "10 simulation sessions per month",
      "Progress tracking and analytics",
      "Basic practice tests",
      "Email support",
      "Mobile app access",
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
    name: "Premium Plan",
    description: "Advanced features for serious medical professionals",
    price: 39.99,
    currency: "USD",
    duration: 30,
    features: [
      "Access to 50+ medical cases",
      "Unlimited simulation sessions",
      "Advanced analytics and reporting",
      "Comprehensive practice tests",
      "Priority email support",
      "Offline case downloads",
      "Custom case creation",
      "Certificate generation",
      "Progress sharing with mentors",
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
    name: "Enterprise Plan",
    description: "Complete solution for medical institutions and teams",
    price: 99.99,
    currency: "USD",
    duration: 30,
    features: [
      "Access to all medical cases (100+)",
      "Unlimited everything",
      "Team management and analytics",
      "Custom branding options",
      "API access for integration",
      "Dedicated account manager",
      "Phone and video support",
      "Custom training programs",
      "Bulk user management",
      "Advanced reporting and insights",
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
