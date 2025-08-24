import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  CreditCard,
} from "lucide-react";
import { adminAPI } from "../utils/api";
import StripePlanManager from "../components/StripePlanManager";

interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  duration: number;
  keyFeatures: string[];
  limits: {
    casesPerMonth: number;
    simulationsPerMonth: number;
    practiceTests: number;
    certificates: number;
    prioritySupport: boolean;
    offlineAccess: boolean;
    customCases: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlanForm {
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
}

const SubscriptionPlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [existingPlanNames, setExistingPlanNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "stripe">("plans");
  const [formData, setFormData] = useState<PlanForm>({
    name: "",
    tagline: "",
    price: 0,
    currency: "USD",
    duration: 30,
    keyFeatures: [""],
    casesPerMonth: 0,
    simulationsPerMonth: 0,
    practiceTests: 0,
    certificates: 0,
    prioritySupport: false,
    offlineAccess: false,
    customCases: false,
    popular: false,
    recommended: false,
  });

  useEffect(() => {
    loadPlans();
    loadExistingPlanNames();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getSubscriptionPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingPlanNames = async () => {
    try {
      const response = await adminAPI.getExistingPlanNames();
      setExistingPlanNames(response.data.names || []);
    } catch (error) {
      console.error("Failed to load existing plan names:", error);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.name || !formData.tagline || formData.price < 0) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if plan name already exists
    if (existingPlanNames.includes(formData.name)) {
      alert(
        `A plan with the name "${formData.name}" already exists. Please choose a different name.`
      );
      return;
    }

    try {
      setIsActionLoading(true);
      await adminAPI.createSubscriptionPlan(formData);
      setShowCreateModal(false);
      resetForm();
      loadPlans();
      loadExistingPlanNames(); // Refresh the list of existing names
    } catch (error: any) {
      console.error("Failed to create plan:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create plan. Please try again.";
      alert(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;

    try {
      setIsActionLoading(true);
      await adminAPI.updateSubscriptionPlan(selectedPlan.id, formData);
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error("Failed to update plan:", error);
      alert("Failed to update plan. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      setIsActionLoading(true);
      await adminAPI.deleteSubscriptionPlan(selectedPlan.id);
      setShowDeleteModal(false);
      setSelectedPlan(null);
      loadPlans();
    } catch (error) {
      console.error("Failed to delete plan:", error);
      alert("Failed to delete plan. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    try {
      await adminAPI.toggleSubscriptionPlanStatus(plan.id);
      loadPlans();
    } catch (error) {
      console.error("Failed to toggle plan status:", error);
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      tagline: plan.tagline,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      keyFeatures: plan.keyFeatures,
      casesPerMonth: plan.limits.casesPerMonth,
      simulationsPerMonth: plan.limits.simulationsPerMonth,
      practiceTests: plan.limits.practiceTests,
      certificates: plan.limits.certificates,
      prioritySupport: plan.limits.prioritySupport,
      offlineAccess: plan.limits.offlineAccess,
      customCases: plan.limits.customCases,
      popular: plan.popular || false,
      recommended: plan.recommended || false,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      tagline: "",
      price: 0,
      currency: "USD",
      duration: 30,
      keyFeatures: [""],
      casesPerMonth: 0,
      simulationsPerMonth: 0,
      practiceTests: 0,
      certificates: 0,
      prioritySupport: false,
      offlineAccess: false,
      customCases: false,
      popular: false,
      recommended: false,
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, keyFeatures: [...formData.keyFeatures, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.keyFeatures.filter((_, i) => i !== index);
    setFormData({ ...formData, keyFeatures: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.keyFeatures];
    newFeatures[index] = value;
    setFormData({ ...formData, keyFeatures: newFeatures });
  };

  const formatDuration = (days: number) => {
    if (days === 30) return "month";
    if (days === 365) return "year";
    if (days === 7) return "week";
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage subscription plans and pricing
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Plan
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="border-b border-gray-200"
      >
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("plans")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plans"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab("stripe")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === "stripe"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Stripe Integration</span>
          </button>
        </nav>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "plans" && (
        <>
          {/* Plans Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  plan.isActive ? "border-green-500" : "border-red-500"
                }`}
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600">{plan.tagline}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {plan.popular && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Popular
                      </span>
                    )}
                    {plan.recommended && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${plan.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {formatDuration(plan.duration)}
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Key Features
                  </h4>
                  <ul className="space-y-1">
                    {plan.keyFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Limits
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cases:</span>
                      <span className="font-medium">
                        {plan.limits.casesPerMonth === -1
                          ? "∞"
                          : plan.limits.casesPerMonth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Simulations:</span>
                      <span className="font-medium">
                        {plan.limits.simulationsPerMonth === -1
                          ? "∞"
                          : plan.limits.simulationsPerMonth}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(plan)}
                      className={`p-2 rounded-md transition-colors ${
                        plan.isActive
                          ? "text-green-600 hover:text-green-800"
                          : "text-red-600 hover:text-red-800"
                      }`}
                      title={plan.isActive ? "Deactivate" : "Activate"}
                    >
                      {plan.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-md transition-colors"
                      title="Edit Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(plan)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-md transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </>
      )}

      {activeTab === "stripe" && <StripePlanManager onRefresh={loadPlans} />}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateModal ? "Create New Plan" : "Edit Plan"}
            </h3>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Basic, Premium"
                  />
                  {existingPlanNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Existing plans: {existingPlanNames.join(", ")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Perfect for students"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={7}>7 days (Week)</option>
                    <option value={30}>30 days (Month)</option>
                    <option value={365}>365 days (Year)</option>
                  </select>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 15 cases/month"
                      />
                      {formData.keyFeatures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cases per Month
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.casesPerMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        casesPerMonth: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Simulations per Month
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.simulationsPerMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        simulationsPerMonth: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practice Tests
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.practiceTests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        practiceTests: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificates
                  </label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.certificates}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificates: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>

              {/* Boolean Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.prioritySupport}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prioritySupport: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Priority Support
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.offlineAccess}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offlineAccess: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Offline Access
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.customCases}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customCases: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Custom Cases
                  </span>
                </label>
              </div>

              {/* Plan Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) =>
                      setFormData({ ...formData, popular: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as Popular
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.recommended}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommended: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as Recommended
                  </span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreatePlan : handleEditPlan}
                disabled={isActionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isActionLoading
                  ? "Saving..."
                  : showCreateModal
                    ? "Create Plan"
                    : "Update Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Plan
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the plan{" "}
              <strong>{selectedPlan.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone. The plan will be marked as inactive.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={isActionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isActionLoading ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansManagement;
