import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, AlertCircle, X, Star, Crown } from "lucide-react";
import api from "../utils/api";

interface SubscriptionCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    tagline: string;
    keyFeatures: string[];
  };
  onSuccess: () => void;
}

const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details"
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create subscription on the backend using the plan ID
      const response = await api.post("/payments/subscriptions", {
        planId: selectedPlan.id,
      });

      if (response.data.subscription) {
        // If subscription was created successfully, move to success step
        setStep("success");
        onSuccess();
      } else {
        throw new Error("Failed to create subscription");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Subscription failed";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId === "default-premium")
      return <Star className="w-5 h-5 text-yellow-500" />;
    if (planId === "default-enterprise")
      return <Crown className="w-5 h-5 text-purple-500" />;
    return <Check className="w-5 h-5 text-blue-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Complete Your Subscription
                </h2>
                <p className="text-blue-100 mt-1">
                  You're almost there! Complete your payment to get started.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Plan Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {getPlanIcon(selectedPlan.id)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedPlan.name} Plan
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedPlan.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(selectedPlan.price)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      What's included:
                    </h4>
                    <div className="space-y-2">
                      {selectedPlan.keyFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setStep("payment")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <button
                    onClick={() => setStep("details")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>←</span>
                    <span>Back to plan details</span>
                  </button>

                  {/* Payment Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Element */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Information
                      </label>
                      <div className="border border-gray-300 rounded-lg p-3 bg-white">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#1f2937",
                                "::placeholder": {
                                  color: "#9ca3af",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-800 font-medium">
                            Subscription Error
                          </p>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!stripe || isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Start {selectedPlan.name} Subscription</span>
                        </>
                      )}
                    </button>

                    {/* Security Notice */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span>Your payment is secure and encrypted</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Powered by Stripe • PCI DSS compliant
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  {/* Success Icon */}
                  <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>

                  {/* Success Message */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to {selectedPlan.name}!
                    </h3>
                    <p className="text-gray-600">
                      Your subscription has been activated successfully. You now
                      have access to all {selectedPlan.name} features.
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-900 mb-2">
                      What's next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Explore your new features immediately</li>
                      <li>• Check your email for confirmation</li>
                      <li>• Access unlimited cases and simulations</li>
                    </ul>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionCheckout;
