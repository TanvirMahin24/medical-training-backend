import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Award,
  CreditCard,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react";
import { AdminStats } from "../types";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, using mock data. Replace with actual API call
        const mockStats: AdminStats = {
          totalUsers: 1247,
          activeUsers: 892,
          totalCases: 156,
          totalRevenue: 45600,
          monthlyGrowth: 12.5,
          userEngagement: 78.3,
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Active Users",
      value: stats?.activeUsers || 0,
      change: "+8%",
      changeType: "positive" as const,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      name: "Total Cases",
      value: stats?.totalCases || 0,
      change: "+5%",
      changeType: "positive" as const,
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      name: "Monthly Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: CreditCard,
      color: "bg-yellow-500",
    },
  ];

  const quickActions = [
    {
      name: "Add New Case",
      description: "Create a new medical training case",
      icon: Plus,
      href: "/cases",
      color: "bg-blue-500",
    },
    {
      name: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/users",
      color: "bg-green-500",
    },
    {
      name: "Create Badge",
      description: "Design new achievement badges",
      icon: Award,
      href: "/badges",
      color: "bg-purple-500",
    },
    {
      name: "View Analytics",
      description: "Check platform performance metrics",
      icon: TrendingUp,
      href: "/analytics",
      color: "bg-yellow-500",
    },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your medical training
          platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="admin-card">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative rounded-lg border border-admin-border bg-white p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {action.name}
                  </h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  New user registered
                </p>
                <p className="text-xs text-gray-500">
                  Dr. Sarah Johnson joined the platform
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  New case published
                </p>
                <p className="text-xs text-gray-500">
                  "Advanced Cardiology Case Study" is now live
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">4 hours ago</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Badge earned
                </p>
                <p className="text-xs text-gray-500">
                  Dr. Mike Chen earned "Case Master" badge
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
