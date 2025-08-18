import React, { useState } from "react";
import { Crown } from "lucide-react";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";
import { useSubscriptionUpgrade } from "../hooks/useSubscriptionUpgrade";
import { useAuth } from "../contexts/AuthContext";

interface UpgradeButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { upgradeSubscription } = useSubscriptionUpgrade();

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeSubscription(planId);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white";
      case "secondary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "outline":
        return "border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50";
      default:
        return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  return (
    <>
      <button
        onClick={() => setShowUpgradeModal(true)}
        className={`inline-flex items-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        {children || "Upgrade"}
      </button>

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentSubscriptionStatus={user?.subscriptionStatus || "TRIAL"}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default UpgradeButton;
