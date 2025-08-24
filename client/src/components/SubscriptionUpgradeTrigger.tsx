import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, AlertTriangle } from "lucide-react";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";
import { useSubscriptionUpgrade } from "../hooks/useSubscriptionUpgrade";
import { useAuth } from "../contexts/AuthContext";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";

interface SubscriptionUpgradeTriggerProps {
  triggerType?: "limit-reached" | "feature-locked" | "premium-feature";
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

const SubscriptionUpgradeTrigger: React.FC<SubscriptionUpgradeTriggerProps> = ({
  triggerType = "feature-locked",
  message,
  className = "",
  children,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { upgradeSubscription } = useSubscriptionUpgrade();
  const { plans, getCurrentUserPlan } = useSubscriptionPlans();

  const currentPlan = getCurrentUserPlan(user?.subscriptionStatus || "TRIAL");
  const hasUpgradeOptions = currentPlan
    ? plans.some((plan) => plan.id !== currentPlan.id && plan.price > 0)
    : plans.some((plan) => plan.price > 0);

  const getTriggerContent = () => {
    switch (triggerType) {
      case "limit-reached":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          title: "Limit Reached",
          description:
            message || "You've reached your plan limit. Upgrade to continue.",
          buttonText: "Upgrade Plan",
          buttonColor: "bg-orange-500 hover:bg-orange-600",
        };
      case "feature-locked":
        return {
          icon: <Lock className="w-5 h-5 text-gray-500" />,
          title: "Feature Locked",
          description:
            message || "This feature is not available in your current plan.",
          buttonText: "Unlock Feature",
          buttonColor: "bg-gray-500 hover:bg-gray-600",
        };
      case "premium-feature":
        return {
          icon: <Crown className="w-5 h-5 text-yellow-500" />,
          title: "Premium Feature",
          description:
            message ||
            "Upgrade to access premium features and accelerate your learning.",
          buttonText: "Go Premium",
          buttonColor:
            "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
        };
      default:
        return {
          icon: <Crown className="w-5 h-5 text-blue-500" />,
          title: "Upgrade Available",
          description: message || "Upgrade your plan to unlock more features.",
          buttonText: "Upgrade Now",
          buttonColor: "bg-blue-500 hover:bg-blue-600",
        };
    }
  };

  const triggerContent = getTriggerContent();

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeSubscription(planId);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  // If user is already on the highest plan or no upgrade options, don't show trigger
  if (!hasUpgradeOptions) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">{triggerContent.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              {triggerContent.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {triggerContent.description}
            </p>
            <div className="mt-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${triggerContent.buttonColor}`}
              >
                <Crown className="w-4 h-4 mr-2" />
                {triggerContent.buttonText}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentSubscriptionStatus={user?.subscriptionStatus || "TRIAL"}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default SubscriptionUpgradeTrigger;
