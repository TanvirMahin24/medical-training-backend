import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Power,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Zap,
} from "lucide-react";
import api from "../../utils/api";

interface StripePlanStatus {
  synced: boolean;
  productId?: string;
  priceId?: string;
  active: boolean;
  error?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  isActive: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  stripeActive: boolean;
}

interface StripePlanManagerProps {
  onRefresh?: () => void;
}

const StripePlanManager: React.FC<StripePlanManagerProps> = ({ onRefresh }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, StripePlanStatus>>(
    {}
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/subscription-plans");
      setPlans(response.data);

      // Fetch Stripe status for each plan
      for (const plan of response.data) {
        await fetchStripeStatus(plan.id);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeStatus = async (planId: string) => {
    try {
      const response = await api.get(`/admin/stripe-plans/status/${planId}`);
      setStatuses((prev) => ({
        ...prev,
        [planId]: response.data.stripeStatus,
      }));
    } catch (error) {
      console.error(`Failed to fetch status for plan ${planId}:`, error);
    }
  };

  const syncPlanToStripe = async (planId: string) => {
    try {
      setSyncing(planId);
      await api.post("/admin/stripe-plans/sync", { planId });
      await fetchStripeStatus(planId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(`Failed to sync plan ${planId}:`, error);
    } finally {
      setSyncing(null);
    }
  };

  const deactivateStripePlan = async (planId: string) => {
    try {
      setSyncing(planId);
      await api.post("/admin/stripe-plans/deactivate", { planId });
      await fetchStripeStatus(planId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(`Failed to deactivate plan ${planId}:`, error);
    } finally {
      setSyncing(null);
    }
  };

  const syncAllPlans = async () => {
    try {
      setLoading(true);
      await api.post("/admin/stripe-plans/sync-all");
      await fetchPlans();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to sync all plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: StripePlanStatus) => {
    if (status.error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (status.active) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status.synced) {
      return <Zap className="w-5 h-5 text-yellow-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (status: StripePlanStatus) => {
    if (status.error) return "Error";
    if (status.active) return "Active";
    if (status.synced) return "Synced";
    return "Not Synced";
  };

  const getStatusColor = (status: StripePlanStatus) => {
    if (status.error) return "text-red-600 bg-red-50 border-red-200";
    if (status.active) return "text-green-600 bg-green-50 border-green-200";
    if (status.synced) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Stripe Plan Management
          </h2>
          <p className="text-gray-600">
            Manage subscription plans and their Stripe integration
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPlans}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={syncAllPlans}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Sync All Plans
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const status = statuses[plan.id];
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              {/* Plan Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600">
                    ${plan.price} {plan.currency} per month
                  </p>
                </div>
                <div
                  className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                >
                  {status && getStatusIcon(status)}
                  <span className="ml-1">
                    {status ? getStatusText(status) : "Unknown"}
                  </span>
                </div>
              </div>

              {/* Stripe Details */}
              {status && (
                <div className="space-y-2 mb-4">
                  {status.productId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Product ID:</span>
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {status.productId}
                        </code>
                        <button
                          onClick={() =>
                            window.open(
                              `https://dashboard.stripe.com/products/${status.productId}`,
                              "_blank"
                            )
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  {status.priceId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price ID:</span>
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {status.priceId}
                        </code>
                        <button
                          onClick={() =>
                            window.open(
                              `https://dashboard.stripe.com/prices/${status.priceId}`,
                              "_blank"
                            )
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  {status.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {status.error}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {!status || !status.active ? (
                  <button
                    onClick={() => syncPlanToStripe(plan.id)}
                    disabled={syncing === plan.id}
                    className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {syncing === plan.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    {syncing === plan.id ? "Syncing..." : "Sync to Stripe"}
                  </button>
                ) : (
                  <button
                    onClick={() => deactivateStripePlan(plan.id)}
                    disabled={syncing === plan.id}
                    className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {syncing === plan.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Power className="w-4 h-4 mr-2" />
                    )}
                    {syncing === plan.id ? "Deactivating..." : "Deactivate"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No subscription plans found
          </h3>
          <p className="text-gray-600">
            Create subscription plans first, then sync them to Stripe.
          </p>
        </div>
      )}
    </div>
  );
};

export default StripePlanManager;
