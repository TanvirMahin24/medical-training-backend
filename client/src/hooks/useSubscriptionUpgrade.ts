import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

interface UseSubscriptionUpgradeReturn {
  isUpgrading: boolean;
  upgradeError: string | null;
  upgradeSubscription: (planId: string) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionUpgrade = (): UseSubscriptionUpgradeReturn => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const { user } = useAuth();

  const upgradeSubscription = useCallback(
    async (planId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsUpgrading(true);
      setUpgradeError(null);

      try {
        // Create a new subscription for the user
        const response = await api.post("/subscriptions", {
          planType: planId,
          userId: user.id,
        });

        if (response.data.success) {
          // Note: User state will be updated when they refresh or re-login
          // For now, we'll just show success and redirect to payment if needed

          // Redirect to payment page or show success message
          if (response.data.paymentUrl) {
            window.location.href = response.data.paymentUrl;
          } else {
            // If no payment URL, subscription was created successfully
            console.log("Subscription upgraded successfully");
            // Optionally refresh the page to update user state
            window.location.reload();
          }
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to upgrade subscription";
        setUpgradeError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUpgrading(false);
      }
    },
    [user]
  );

  const clearError = useCallback(() => {
    setUpgradeError(null);
  }, []);

  return {
    isUpgrading,
    upgradeError,
    upgradeSubscription,
    clearError,
  };
};
