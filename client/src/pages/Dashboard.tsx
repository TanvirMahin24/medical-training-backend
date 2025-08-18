import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import api from "../utils/api";
import SubscriptionUpgradeTrigger from "../components/SubscriptionUpgradeTrigger";

interface DashboardStats {
  totalCases: number;
  completedCases: number;
  currentStreak: number;
  totalScore: number;
  badgesEarned: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: "case_completed" | "badge_earned" | "streak_milestone";
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    completedCases: 0,
    currentStreak: 0,
    totalScore: 0,
    badgesEarned: 0,
    averageScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [summaryRes, badgesRes] = await Promise.all([
          api.get("/progress/summary"),
          api.get("/badges/me"),
        ]);
        const summary = summaryRes.data;
        const badges = badgesRes.data || [];

        setStats({
          totalCases: summary.totalCases,
          completedCases: summary.completedCases,
          currentStreak: summary.currentStreak,
          totalScore: (summary.recentScores || []).reduce(
            (s: number, r: any) => s + (r.score || 0),
            0
          ),
          badgesEarned: badges.length,
          averageScore: summary.averageScore,
        });

        const recent = (summary.recentScores || []).map(
          (r: any, idx: number) => ({
            id: String(idx + 1),
            type: "case_completed" as const,
            title: r.caseTitle,
            description: `Completed with ${r.score}% accuracy`,
            timestamp: new Date(r.date).toLocaleString(),
            score: r.score,
          })
        );
        setRecentActivity(recent);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "case_completed":
        return "✅";
      case "badge_earned":
        return "🏆";
      case "streak_milestone":
        return "🔥";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "case_completed":
        return "text-green-600 bg-green-100";
      case "badge_earned":
        return "text-yellow-600 bg-yellow-100";
      case "streak_milestone":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
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
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || "Medical Professional"}!
        </h1>
        <p className="text-blue-100">
          Continue your medical training journey. You're making great progress!
        </p>
      </motion.div>

      {/* Subscription Upgrade Trigger */}
      <SubscriptionUpgradeTrigger
        triggerType="premium-feature"
        message="Upgrade to unlock advanced analytics, unlimited cases, and premium features"
        className="mb-4"
      />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link
          to="/cases"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-3">📚</div>
            <div>
              <h3 className="font-semibold text-gray-900">Start New Case</h3>
              <p className="text-sm text-gray-600">
                Practice with medical scenarios
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/progress"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900">View Progress</h3>
              <p className="text-sm text-gray-600">Track your performance</p>
            </div>
          </div>
        </Link>

        <Link
          to="/badges"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-3">🏆</div>
            <div>
              <h3 className="font-semibold text-gray-900">Earn Badges</h3>
              <p className="text-sm text-gray-600">Unlock achievements</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📈</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedCases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.currentStreak} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalScore}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏆</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.badgesEarned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-md"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                {activity.score && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {activity.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          This Week's Progress
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Cases Completed
            </span>
            <span className="text-sm font-semibold text-gray-900">5/7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: "71%" }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Learning Streak
            </span>
            <span className="text-sm font-semibold text-gray-900">7 days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Average Score
            </span>
            <span className="text-sm font-semibold text-gray-900">89.2%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: "89%" }}
            ></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
