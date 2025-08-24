import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Crown, Zap } from "lucide-react";
import {
  useSubscriptionPlans,
  SubscriptionPlan,
} from "../hooks/useSubscriptionPlans";
import SubscriptionCheckout from "./SubscriptionCheckout";

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
  const [showCheckout, setShowCheckout] = useState(false);

  const {
    plans,
    loading,
    error,
    getCurrentUserPlan,
    getUpgradeOptions,
    formatPrice,
    formatDuration,
  } = useSubscriptionPlans();

  const currentPlan = getCurrentUserPlan(currentSubscriptionStatus);
  const upgradeOptions = currentPlan ? getUpgradeOptions(currentPlan.id) : [];

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-red-600 text-xl mb-4">Error loading plans</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Upgrade Your Subscription
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Choose the perfect plan for your medical training needs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Current Plan Info */}
              {currentPlan ? (
                <div className="p-6 md:p-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Current Plan: {currentPlan.name}
                  </h3>
                  <p className="text-gray-600">{currentPlan.tagline}</p>
                </div>
              ) : (
                <div className="p-6 md:p-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Loading current plan...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we load your subscription information.
                  </p>
                </div>
              )}

              {/* Upgrade Options */}
              {currentPlan && upgradeOptions.length > 0 ? (
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Available Plans
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upgradeOptions.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Plan Header */}
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 mt-2">
                            {plan.name}
                          </h4>
                          <p className="text-gray-600 text-sm mt-2">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(plan.price, plan.currency)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            per {formatDuration(plan.duration)}
                          </div>
                        </div>

                        {/* Key Features */}
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Key Features
                          </h5>
                          <ul className="space-y-1">
                            {plan.keyFeatures
                              .slice(0, 3)
                              .map((feature, featureIndex) => (
                                <li
                                  key={featureIndex}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                          </ul>
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
                          {selectedPlan === plan.id
                            ? "Selected"
                            : "Select Plan"}
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Upgrade Button */}
                  {selectedPlan && currentPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 text-center"
                    >
                      <button
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Upgrade to{" "}
                        {
                          upgradeOptions.find((p) => p.id === selectedPlan)
                            ?.name
                        }
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Complete your payment securely with Stripe
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="p-6 md:p-8 text-center">
                  <p className="text-gray-600">
                    No upgrade options available at this time.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stripe Checkout Modal */}
      {showCheckout &&
        selectedPlan &&
        currentPlan &&
        upgradeOptions.length > 0 && (
          <SubscriptionCheckout
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            selectedPlan={{
              id: selectedPlan,
              name:
                upgradeOptions.find((p) => p.id === selectedPlan)?.name || "",
              price:
                upgradeOptions.find((p) => p.id === selectedPlan)?.price || 0,
              tagline:
                upgradeOptions.find((p) => p.id === selectedPlan)?.tagline ||
                "",
              keyFeatures:
                upgradeOptions.find((p) => p.id === selectedPlan)
                  ?.keyFeatures || [],
            }}
            onSuccess={handleCheckoutSuccess}
          />
        )}
    </>
  );
};

export default SubscriptionUpgradeModal;
