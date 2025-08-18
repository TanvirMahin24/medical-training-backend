import React, { useState, useEffect } from "react";
import { adminAPI } from "../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  caseAnalytics: {
    totalCases: number;
    completedCases: number;
    averageScore: number;
    difficultyDistribution: {
      BEGINNER: number;
      INTERMEDIATE: number;
      ADVANCED: number;
      EXPERT: number;
    };
    categoryDistribution: Array<{
      category: string;
      count: number;
      averageScore: number;
    }>;
  };
  userBehavior: {
    sessionDuration: {
      average: number;
      median: number;
      distribution: Array<{ range: string; count: number }>;
    };
    engagementMetrics: {
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
      averageSessionsPerUser: number;
    };
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    subscriptionMetrics: {
      totalSubscriptions: number;
      activeSubscriptions: number;
      churnRate: number;
      averageRevenuePerUser: number;
    };
  };
  learning: {
    skillProgression: Array<{
      skill: string;
      averageImprovement: number;
      usersCount: number;
    }>;
    competencyMapping: Array<{
      competency: string;
      usersCount: number;
      averageLevel: number;
    }>;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || "No data available"}</p>
        <button
          onClick={fetchAnalyticsData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "cases", name: "Case Analytics", icon: "🏥" },
    { id: "users", name: "User Behavior", icon: "👥" },
    { id: "revenue", name: "Revenue", icon: "💰" },
    { id: "learning", name: "Learning Analytics", icon: "🎓" },
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Total Cases
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          {analyticsData.caseAnalytics.totalCases}
        </p>
        <p className="text-sm text-gray-500">Available for training</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Active Users
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {analyticsData.userBehavior.engagementMetrics.dailyActiveUsers}
        </p>
        <p className="text-sm text-gray-500">Daily active users</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Total Revenue
        </h3>
        <p className="text-3xl font-bold text-purple-600">
          ${(analyticsData.revenue.totalRevenue / 100).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">Lifetime revenue</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg Score</h3>
        <p className="text-3xl font-bold text-orange-600">
          {analyticsData.caseAnalytics.averageScore.toFixed(1)}
        </p>
        <p className="text-sm text-gray-500">Across all cases</p>
      </div>
    </div>
  );

  const renderCaseAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Difficulty Distribution
          </h3>
          <Doughnut
            data={{
              labels: Object.keys(
                analyticsData.caseAnalytics.difficultyDistribution
              ),
              datasets: [
                {
                  data: Object.values(
                    analyticsData.caseAnalytics.difficultyDistribution
                  ),
                  backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Category Performance
          </h3>
          <Bar
            data={{
              labels: analyticsData.caseAnalytics.categoryDistribution.map(
                (c) => c.category
              ),
              datasets: [
                {
                  label: "Average Score",
                  data: analyticsData.caseAnalytics.categoryDistribution.map(
                    (c) => c.averageScore
                  ),
                  backgroundColor: "#3B82F6",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Case Completion Rate
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {(
                (analyticsData.caseAnalytics.completedCases /
                  analyticsData.caseAnalytics.totalCases) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-sm text-gray-500">Completion rate</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {analyticsData.caseAnalytics.completedCases}
            </p>
            <p className="text-sm text-gray-500">
              of {analyticsData.caseAnalytics.totalCases} cases
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserBehavior = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            User Engagement
          </h3>
          <Bar
            data={{
              labels: ["Daily", "Weekly", "Monthly"],
              datasets: [
                {
                  label: "Active Users",
                  data: [
                    analyticsData.userBehavior.engagementMetrics
                      .dailyActiveUsers,
                    analyticsData.userBehavior.engagementMetrics
                      .weeklyActiveUsers,
                    analyticsData.userBehavior.engagementMetrics
                      .monthlyActiveUsers,
                  ],
                  backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Session Duration Distribution
          </h3>
          <Doughnut
            data={{
              labels:
                analyticsData.userBehavior.sessionDuration.distribution.map(
                  (d) => d.range
                ),
              datasets: [
                {
                  data: analyticsData.userBehavior.sessionDuration.distribution.map(
                    (d) => d.count
                  ),
                  backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Avg Session Duration
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(
              analyticsData.userBehavior.sessionDuration.average / 60
            )}{" "}
            min
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sessions per User
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {
              analyticsData.userBehavior.engagementMetrics
                .averageSessionsPerUser
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Median Session
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(analyticsData.userBehavior.sessionDuration.median / 60)}{" "}
            min
          </p>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Monthly Revenue Trend
        </h3>
        <Line
          data={{
            labels: analyticsData.revenue.monthlyRevenue.map((r) => r.month),
            datasets: [
              {
                label: "Revenue ($)",
                data: analyticsData.revenue.monthlyRevenue.map(
                  (r) => r.revenue / 100
                ),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Subscription Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Subscriptions:</span>
              <span className="font-semibold">
                {analyticsData.revenue.subscriptionMetrics.totalSubscriptions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Subscriptions:</span>
              <span className="font-semibold text-green-600">
                {analyticsData.revenue.subscriptionMetrics.activeSubscriptions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Churn Rate:</span>
              <span className="font-semibold text-red-600">
                {analyticsData.revenue.subscriptionMetrics.churnRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ARPU:</span>
              <span className="font-semibold">
                $
                {
                  analyticsData.revenue.subscriptionMetrics
                    .averageRevenuePerUser
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Plan Distribution
          </h3>
          <Doughnut
            data={{
              labels: analyticsData.revenue.planDistribution.map((p) => p.plan),
              datasets: [
                {
                  data: analyticsData.revenue.planDistribution.map(
                    (p) => p.users
                  ),
                  backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Skill Progression
          </h3>
          <Bar
            data={{
              labels: analyticsData.learning.skillProgression.map(
                (s) => s.skill
              ),
              datasets: [
                {
                  label: "Average Improvement (%)",
                  data: analyticsData.learning.skillProgression.map(
                    (s) => s.averageImprovement
                  ),
                  backgroundColor: "#3B82F6",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Competency Levels
          </h3>
          <Bar
            data={{
              labels: analyticsData.learning.competencyMapping.map(
                (c) => c.competency
              ),
              datasets: [
                {
                  label: "Average Level",
                  data: analyticsData.learning.competencyMapping.map(
                    (c) => c.averageLevel
                  ),
                  backgroundColor: "#10B981",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, max: 5 },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Learning Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.learning.skillProgression.map((skill, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                {skill.skill}
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {skill.averageImprovement}%
              </p>
              <p className="text-sm text-gray-500">{skill.usersCount} users</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "cases":
        return renderCaseAnalytics();
      case "users":
        return renderUserBehavior();
      case "revenue":
        return renderRevenue();
      case "learning":
        return renderLearning();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into platform performance and user behavior
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchAnalyticsData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
