import axios from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:4005/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Authentication
  login: (email: string, password: string) =>
    api.post("/admin/auth/login", { email, password }),
  getProfile: () => api.get("/admin/profile"),

  // Users
  getUsers: (params?: any) => api.get("/admin/users", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Cases
  getCases: (params?: any) => api.get("/admin/cases", { params }),
  getCase: (id: string) => api.get(`/admin/cases/${id}`),
  createCase: (data: any) => api.post("/admin/cases", data),
  updateCase: (id: string, data: any) => api.patch(`/admin/cases/${id}`, data),
  deleteCase: (id: string) => api.delete(`/admin/cases/${id}`),

  // Badges
  getBadges: (params?: any) => api.get("/admin/badges", { params }),
  getBadge: (id: string) => api.get(`/admin/badges/${id}`),
  createBadge: (data: any) => api.post("/admin/badges", data),
  updateBadge: (id: string, data: any) =>
    api.patch(`/admin/badges/${id}`, data),
  deleteBadge: (id: string) => api.delete(`/admin/badges/${id}`),

  // Subscriptions
  getSubscriptions: (params?: any) =>
    api.get("/admin/subscriptions", { params }),
  getSubscription: (id: string) => api.get(`/admin/subscriptions/${id}`),
  createSubscription: (data: any) => api.post("/admin/subscriptions", data),
  updateSubscription: (id: string, data: any) => api.put(`/admin/subscriptions/${id}`, data),
  deleteSubscription: (id: string) => api.delete(`/admin/subscriptions/${id}`),
  reactivateSubscription: (id: string) => api.post(`/admin/subscriptions/${id}/reactivate`),

  // Payments
  getPayments: (params?: any) => api.get("/admin/payments", { params }),
  getPayment: (id: string) => api.get(`/admin/payments/${id}`),

  // Progress
  getUserProgress: (userId: string) =>
    api.get(`/admin/users/${userId}/progress`),

  // Analytics
  getStats: () => api.get("/admin/stats"),
  getAnalytics: (params?: any) => api.get("/admin/analytics", { params }),

  // Advanced Analytics
  getCaseAnalytics: () => api.get("/analytics/cases"),
  getUserBehaviorAnalytics: () => api.get("/analytics/user-behavior"),
  getRevenueAnalytics: () => api.get("/analytics/revenue"),
  getLearningAnalytics: () => api.get("/analytics/learning"),
  getComprehensiveAnalytics: () => api.get("/analytics/comprehensive"),
  getUserRecommendations: (userId: string) =>
    api.get(`/analytics/user/${userId}/recommendations`),
  getPerformanceTrends: (period?: string) =>
    api.get("/analytics/performance/trends", { params: { period } }),

  // Monitoring
  getPerformanceMetrics: () => api.get("/monitoring/metrics"),
  getSystemHealth: () => api.get("/monitoring/health"),
  getPerformanceHistory: (hours?: number) =>
    api.get("/monitoring/history", { params: { hours } }),
  getMonitoringDashboard: () => api.get("/monitoring/dashboard"),
};

export default api;
