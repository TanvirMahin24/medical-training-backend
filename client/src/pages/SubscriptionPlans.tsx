import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Crown, Zap, ArrowRight } from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
  getCurrentUserPlan,
  formatPrice,
  formatDuration,
} from "../config/subscriptionPlans";
import { useAuth } from "../contexts/AuthContext";
import SubscriptionUpgradeModal from "../components/SubscriptionUpgradeModal";
import { useSubscriptionUpgrade } from "../hooks/useSubscriptionUpgrade";

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { upgradeSubscription } = useSubscriptionUpgrade();

  const currentPlan = getCurrentUserPlan(user?.subscriptionStatus || "TRIAL");

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeSubscription(planId);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.popular) return <Star className="w-6 h-6 text-yellow-500" />;
    if (plan.recommended) return <Crown className="w-6 h-6 text-purple-500" />;
    if (plan.id === "enterprise")
      return <Zap className="w-6 h-6 text-blue-500" />;
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

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return plan.id === currentPlan.id;
  };

  const canUpgradeTo = (plan: SubscriptionPlan) => {
    if (plan.id === "trial") return false;
    if (isCurrentPlan(plan)) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan to accelerate your medical training journey.
            Start with our free trial and upgrade as you grow.
          </p>

          {/* Current Plan Display */}
          <div className="mt-8 inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="font-semibold text-gray-900">{currentPlan.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-visible h-full min-h-[520px] flex flex-col ${
                isCurrentPlan(plan)
                  ? "ring-4 ring-blue-500 ring-opacity-50"
                  : "hover:shadow-2xl transition-shadow duration-300"
              }`}
            >
              {/* Plan Badge */}
              {getPlanBadge(plan) && (
                <div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(plan)}`}
                >
                  {getPlanBadge(plan)}
                </div>
              )}

              {/* Plan Header */}
              <div className="p-6 md:p-8 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {getPlanIcon(plan)}
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-gray-500">
                    per {formatDuration(plan.duration)}
                  </div>
                </div>

                {/* Current Plan Indicator */}
                {isCurrentPlan(plan) && (
                  <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Check className="w-4 h-4 mr-1" />
                      Current Plan
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="px-6 md:px-8 pb-6 md:pb-8 flex-1">
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {isCurrentPlan(plan) ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : canUpgradeTo(plan) ? (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade your plan at any time. Your new features
                will be available immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Absolutely! Start with our free trial to explore the platform
                and see if it's right for you.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and PayPal for
                your convenience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel anytime. You'll continue to have access
                until the end of your billing period.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentSubscriptionStatus={user?.subscriptionStatus || "TRIAL"}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default SubscriptionPlans;
