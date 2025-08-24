import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UseSubscriptionUpgradeReturn {
  isUpgrading: boolean;
  upgradeError: string | null;
  upgradeSubscription: (planId: string) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionUpgrade = (): UseSubscriptionUpgradeReturn => {
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const { user } = useAuth();

  const upgradeSubscription = useCallback(
    async (planId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // This function now just triggers the checkout modal
      // The actual subscription creation happens in the checkout component
      console.log(`Starting upgrade to ${planId} plan`);
    },
    [user]
  );

  const clearError = useCallback(() => {
    setUpgradeError(null);
  }, []);

  return {
    isUpgrading: false, // Always false since we're not using this state anymore
    upgradeError,
    upgradeSubscription,
    clearError,
  };
};
