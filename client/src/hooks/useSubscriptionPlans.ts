import { useState, useEffect } from "react";
import { subscriptionAPI } from "../utils/api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  duration: number;
  keyFeatures: string[];
  casesPerMonth: number;
  simulationsPerMonth: number;
  practiceTests: number;
  certificates: number;
  prioritySupport: boolean;
  offlineAccess: boolean;
  customCases: boolean;
  popular: boolean;
  recommended: boolean;
  stripeActive: boolean;
}

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getSubscriptionPlans();
      setPlans(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch subscription plans";
      setError(errorMessage);
      console.error("Error fetching subscription plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getPlanById = (id: string): SubscriptionPlan | undefined => {
    return plans.find((plan) => plan.id === id);
  };

  const getCurrentUserPlan = (
    subscriptionStatus: string
  ): SubscriptionPlan | undefined => {
    // If plans are still loading or empty, return undefined
    if (plans.length === 0) {
      return undefined;
    }

    switch (subscriptionStatus) {
      case "ACTIVE":
        // Find the first premium plan or fallback to the first paid plan
        const premiumPlan = plans.find(
          (plan) => plan.recommended || plan.popular
        );
        return premiumPlan || plans.find((plan) => plan.price > 0) || plans[0];
      case "TRIAL":
        return plans.find((plan) => plan.price === 0) || plans[0];
      case "EXPIRED":
        return plans.find((plan) => plan.price === 0) || plans[0];
      default:
        return plans.find((plan) => plan.price === 0) || plans[0];
    }
  };

  const getUpgradeOptions = (
    currentPlanId: string | undefined
  ): SubscriptionPlan[] => {
    // If no current plan ID, return all paid plans
    if (!currentPlanId) {
      return plans.filter((plan) => plan.price > 0);
    }

    const currentPlanIndex = plans.findIndex(
      (plan) => plan.id === currentPlanId
    );
    if (currentPlanIndex === -1) return plans.filter((plan) => plan.price > 0); // All paid plans if current plan not found

    return plans.slice(currentPlanIndex + 1).filter((plan) => plan.price > 0); // Only plans above current and paid plans
  };

  const formatPrice = (price: number, currency: string = "USD"): string => {
    if (price === 0) return "Free";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDuration = (days: number): string => {
    if (days === 30) return "month";
    if (days === 365) return "year";
    if (days === 7) return "week";
    return `${days} days`;
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
    getPlanById,
    getCurrentUserPlan,
    getUpgradeOptions,
    formatPrice,
    formatDuration,
  };
};
