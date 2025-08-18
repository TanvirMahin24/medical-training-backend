import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Crown, Zap } from "lucide-react";
import {
  SubscriptionPlan,
  getCurrentUserPlan,
  getUpgradeOptions,
  getPlanById,
  formatPrice,
  formatDuration,
} from "../config/subscriptionPlans";

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscriptionStatus: string;
  onUpgrade: (planId: string) => void;
}

const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentSubscriptionStatus,
  onUpgrade,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = getCurrentUserPlan(currentSubscriptionStatus);
  const upgradeOptions = getUpgradeOptions(currentPlan.id);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      await onUpgrade(selectedPlan);
      onClose();
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.popular) return <Star className="w-5 h-5 text-yellow-500" />;
    if (plan.recommended) return <Crown className="w-5 h-5 text-purple-500" />;
    if (plan.id === "enterprise")
      return <Zap className="w-5 h-5 text-blue-500" />;
    return null;
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    if (plan.popular) return "Most Popular";
    if (plan.recommended) return "Recommended";
    if (plan.id === "enterprise") return "Enterprise";
    return "";
  };

  const getPlanBadgeColor = (plan: SubscriptionPlan) => {
    if (plan.popular) return "bg-yellow-100 text-yellow-800";
    if (plan.recommended) return "bg-purple-100 text-purple-800";
    if (plan.id === "enterprise") return "bg-blue-100 text-blue-800";
    return "";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Upgrade Your Plan</h2>
                <p className="text-blue-100 mt-2">
                  Unlock more features and accelerate your medical training
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Plan Display */}
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Current Plan</p>
                  <p className="font-semibold text-lg">{currentPlan.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {upgradeOptions.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`relative border-2 rounded-xl p-5 md:p-6 transition-all duration-200 hover:shadow-lg ${
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Plan Badge */}
                  {getPlanBadge(plan) && (
                    <div
                      className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(plan)}`}
                    >
                      {getPlanBadge(plan)}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {getPlanIcon(plan)}
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-gray-500">
                      per {formatDuration(plan.duration)}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limits Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Plan Limits
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cases:</span>
                        <span className="font-medium">
                          {plan.limits.casesPerMonth === -1
                            ? "Unlimited"
                            : plan.limits.casesPerMonth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Simulations:</span>
                        <span className="font-medium">
                          {plan.limits.simulationsPerMonth === -1
                            ? "Unlimited"
                            : plan.limits.simulationsPerMonth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tests:</span>
                        <span className="font-medium">
                          {plan.limits.practiceTests === -1
                            ? "Unlimited"
                            : plan.limits.practiceTests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certificates:</span>
                        <span className="font-medium">
                          {plan.limits.certificates === -1
                            ? "Unlimited"
                            : plan.limits.certificates}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-2.5 md:py-3 px-4 rounded-lg font-medium transition-colors ${
                      selectedPlan === plan.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upgrade Button */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Upgrade to ${getPlanById(selectedPlan)?.name}`
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  You'll be redirected to complete your payment
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionUpgradeModal;
