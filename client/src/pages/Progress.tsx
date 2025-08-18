import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";

interface ProgressData {
  totalCases: number;
  completedCases: number;
  averageScore: number;
  totalTime: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: {
    week: string;
    casesCompleted: number;
    averageScore: number;
  }[];
  categoryPerformance: {
    category: string;
    casesCompleted: number;
    averageScore: number;
    totalTime: number;
  }[];
  recentScores: {
    caseTitle: string;
    score: number;
    date: string;
    timeSpent: number;
  }[];
}

const Progress: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/progress/summary");
        setProgressData(res.data);
      } catch (error) {
        console.error("Failed to load progress data:", error);
        setProgressData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No progress data available.</p>
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
            Progress & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your learning journey and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📚</div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Cases Completed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.completedCases}/{progressData.totalCases}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (progressData.completedCases / progressData.totalCases) * 100
                )}
                % complete
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.averageScore}%
              </p>
              <p className="text-sm text-gray-500">
                Grade: {getScoreGrade(progressData.averageScore)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏱️</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(progressData.totalTime)}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  progressData.totalTime / progressData.completedCases
                )}
                m per case
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
                {progressData.currentStreak} days
              </p>
              <p className="text-sm text-gray-500">
                Best: {progressData.longestStreak} days
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Progress
        </h2>
        <div className="space-y-4">
          {progressData.weeklyProgress.map((week, index) => (
            <div key={week.week} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-600">
                {week.week}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {week.casesCompleted} cases
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {week.averageScore}% avg
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(week.casesCompleted / 7) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance by Category
        </h2>
        <div className="space-y-4">
          {progressData.categoryPerformance.map((category) => (
            <div
              key={category.category}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {category.category}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                    category.averageScore
                  )}`}
                >
                  {category.averageScore}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Cases:</span>{" "}
                  {category.casesCompleted}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{" "}
                  {formatTime(category.totalTime)}
                </div>
                <div>
                  <span className="font-medium">Avg Time:</span>{" "}
                  {formatTime(
                    Math.round(category.totalTime / category.casesCompleted)
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Case Scores
        </h2>
        <div className="space-y-3">
          {progressData.recentScores.map((score, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{score.caseTitle}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(score.date).toLocaleDateString()} •{" "}
                  {formatTime(score.timeSpent)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                    score.score
                  )}`}
                >
                  {score.score}%
                </span>
                <span className="text-sm text-gray-500">
                  Grade: {getScoreGrade(score.score)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">🎯 Strong Areas</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Psychiatry cases: 92% average</li>
              <li>• Consistent daily practice</li>
              <li>• Good time management</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              📚 Areas for Improvement
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Emergency Medicine: 85% average</li>
              <li>• Try more advanced cases</li>
              <li>• Review cardiology fundamentals</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Next Goal:</strong> Complete 2 more cases this week to
            maintain your streak and reach 20 total cases completed!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
