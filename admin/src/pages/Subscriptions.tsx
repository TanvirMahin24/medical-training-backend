import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { adminAPI } from "../utils/api";

interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus: string;
}

interface SubscriptionForm {
  userId: string;
  planType: string;
  stripeSubscriptionId: string;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<SubscriptionForm>({
    userId: "",
    planType: "",
    stripeSubscriptionId: "",
  });
  const [editForm, setEditForm] = useState<SubscriptionForm>({
    userId: "",
    planType: "",
    stripeSubscriptionId: "",
  });

  useEffect(() => {
    loadSubscriptions();
    loadUsers();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getSubscriptions();
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!createForm.userId || !createForm.planType) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsActionLoading(true);
      await adminAPI.createSubscription(createForm);
      setShowCreateModal(false);
      setCreateForm({ userId: "", planType: "", stripeSubscriptionId: "" });
      loadSubscriptions();
      loadUsers(); // Refresh users to update subscription status
    } catch (error) {
      console.error("Failed to create subscription:", error);
      alert("Failed to create subscription. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSubscription = async () => {
    if (!editForm.userId || !editForm.planType) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsActionLoading(true);
      await adminAPI.updateSubscription(selectedSubscription!.id, editForm);
      setShowEditModal(false);
      setSelectedSubscription(null);
      setEditForm({ userId: "", planType: "", stripeSubscriptionId: "" });
      loadSubscriptions();
    } catch (error) {
      console.error("Failed to update subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      setIsActionLoading(true);
      await adminAPI.deleteSubscription(selectedSubscription.id);
      setShowDeleteModal(false);
      setSelectedSubscription(null);
      loadSubscriptions();
      loadUsers(); // Refresh users to update subscription status
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      alert("Failed to delete subscription. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      await adminAPI.deleteSubscription(id);
      loadSubscriptions();
      loadUsers(); // Refresh users to update subscription status
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const handleReactivateSubscription = async (id: string) => {
    try {
      await adminAPI.reactivateSubscription(id);
      loadSubscriptions();
      loadUsers(); // Refresh users to update subscription status
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
    }
  };

  const openEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      userId: subscription.userId,
      planType: subscription.planType,
      stripeSubscriptionId: "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteModal(true);
  };

  const openViewModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "TRIAL":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.user.firstName &&
        sub.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.user.lastName &&
        sub.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const availableUsers = users.filter(
    (user) =>
      user.subscriptionStatus === "TRIAL" ||
      user.subscriptionStatus === "EXPIRED"
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor user subscription status and billing
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Subscription
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadSubscriptions}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Subscriptions ({filteredSubscriptions.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.user.firstName && subscription.user.lastName
                        ? `${subscription.user.firstName} ${subscription.user.lastName}`
                        : subscription.user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.user.email}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subscription.planType.charAt(0).toUpperCase() +
                        subscription.planType.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}
                    >
                      {subscription.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(
                      subscription.currentPeriodStart
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewModal(subscription)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(subscription)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Subscription"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openDeleteModal(subscription)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {subscription.status === "ACTIVE" ? (
                        <button
                          onClick={() =>
                            handleCancelSubscription(subscription.id)
                          }
                          className="text-orange-600 hover:text-orange-900"
                          title="Cancel Subscription"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleReactivateSubscription(subscription.id)
                          }
                          className="text-green-600 hover:text-green-900"
                          title="Reactivate Subscription"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Subscription
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.userId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.planType}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, planType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select plan type</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Subscription ID (Optional)
                </label>
                <input
                  type="text"
                  value={createForm.stripeSubscriptionId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      stripeSubscriptionId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Stripe subscription ID"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubscription}
                disabled={
                  isActionLoading || !createForm.userId || !createForm.planType
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isActionLoading ? "Creating..." : "Create Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Subscription
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.userId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.planType}
                  onChange={(e) =>
                    setEditForm({ ...editForm, planType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Subscription ID (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.stripeSubscriptionId}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stripeSubscriptionId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Stripe subscription ID"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubscription}
                disabled={
                  isActionLoading || !editForm.userId || !editForm.planType
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isActionLoading ? "Updating..." : "Update Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Subscription
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the subscription for{" "}
              <strong>
                {selectedSubscription.user.firstName &&
                selectedSubscription.user.lastName
                  ? `${selectedSubscription.user.firstName} ${selectedSubscription.user.lastName}`
                  : selectedSubscription.user.email}
              </strong>
              ?
            </p>

            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone. The user will lose access to premium
              features.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubscription}
                disabled={isActionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isActionLoading ? "Deleting..." : "Delete Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Subscription Details Modal */}
      {showViewModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedSubscription.user.firstName &&
                    selectedSubscription.user.lastName
                      ? `${selectedSubscription.user.firstName} ${selectedSubscription.user.lastName}`
                      : selectedSubscription.user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedSubscription.user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Type
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedSubscription.planType.charAt(0).toUpperCase() +
                      selectedSubscription.planType.slice(1)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}
                  >
                    {selectedSubscription.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedSubscription.id}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Period
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(
                    selectedSubscription.currentPeriodStart
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    selectedSubscription.currentPeriodEnd
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
