import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import { User } from "../types";
import { adminAPI } from "../utils/api";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for editing user
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
    subscriptionStatus: "TRIAL" as
      | "TRIAL"
      | "ACTIVE"
      | "EXPIRED"
      | "CANCELLED"
      | "PAST_DUE"
      | "UNPAID",
    isEmailVerified: false,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers({
          page: 1,
          limit: 100,
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // Fallback to mock data if API fails
        const mockUsers: User[] = [
          {
            id: "1",
            email: "dr.sarah@example.com",
            firstName: "Sarah",
            lastName: "Johnson",
            role: "USER",
            subscriptionStatus: "ACTIVE",
            isEmailVerified: true,
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            email: "dr.mike@example.com",
            firstName: "Mike",
            lastName: "Chen",
            role: "USER",
            subscriptionStatus: "ACTIVE",
            isEmailVerified: true,
            createdAt: "2024-01-10T14:20:00Z",
            updatedAt: "2024-01-10T14:20:00Z",
          },
          {
            id: "3",
            email: "dr.emma@example.com",
            firstName: "Emma",
            lastName: "Williams",
            role: "USER",
            subscriptionStatus: "TRIAL",
            isEmailVerified: false,
            createdAt: "2024-01-20T09:15:00Z",
            updatedAt: "2024-01-20T09:15:00Z",
          },
        ];
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.subscriptionStatus === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "TRIAL":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // Initialize form with current user data
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      isEmailVerified: user.isEmailVerified || false,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminAPI.deleteUser(selectedUser.id);
      // Remove user from local state
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Call API to update user
      await adminAPI.updateUser(selectedUser.id, editForm);

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, ...editForm } : user
        )
      );

      // Close modal and reset form
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditForm({
        firstName: "",
        lastName: "",
        role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
        subscriptionStatus: "TRIAL" as
          | "TRIAL"
          | "ACTIVE"
          | "EXPIRED"
          | "CANCELLED"
          | "PAST_DUE"
          | "UNPAID",
        isEmailVerified: false,
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and subscriptions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="admin-button-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="admin-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="admin-input"
            >
              <option value="all">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-input"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="admin-button-secondary w-full">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Email Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscriptionStatus)}`}
                    >
                      {user.subscriptionStatus}
                    </span>
                  </td>
                  <td>
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Not Verified
                      </span>
                    )}
                  </td>
                  <td className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View user details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name:
                </label>
                <p className="text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email:
                </label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role:
                </label>
                <p className="text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <p className="text-gray-900">
                  {selectedUser.subscriptionStatus}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Verified:
                </label>
                <p className="text-gray-900">
                  {selectedUser.isEmailVerified ? (
                    <span className="text-green-600 font-medium">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ✗ Not Verified
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Joined:
                </label>
                <p className="text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="admin-button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="admin-input w-full"
                  value={editForm.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="admin-input w-full"
                  value={editForm.subscriptionStatus}
                  onChange={(e) =>
                    handleInputChange("subscriptionStatus", e.target.value)
                  }
                >
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Verification
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.isEmailVerified}
                      onChange={(e) =>
                        handleInputChange("isEmailVerified", e.target.checked)
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Email is verified
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="admin-button-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveUser} className="admin-button-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete User
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {selectedUser.firstName} {selectedUser.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="admin-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
