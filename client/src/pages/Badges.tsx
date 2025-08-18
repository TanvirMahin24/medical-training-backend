import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "achievement" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  isEarned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  requirements: string[];
}

const Badges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filteredBadges, setFilteredBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  useEffect(() => {
    // Simulate loading badges data
    const loadBadges = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data for demonstration
        const mockBadges: Badge[] = [
          {
            id: "1",
            name: "First Steps",
            description: "Complete your first medical case",
            icon: "👣",
            category: "milestone",
            rarity: "common",
            isEarned: true,
            earnedDate: "2024-01-01",
            requirements: ["Complete 1 case"],
          },
          {
            id: "2",
            name: "Streak Master",
            description: "Maintain a 7-day learning streak",
            icon: "🔥",
            category: "achievement",
            rarity: "rare",
            isEarned: true,
            earnedDate: "2024-01-08",
            requirements: ["Maintain 7-day streak"],
          },
          {
            id: "3",
            name: "Cardiology Expert",
            description: "Complete 10 cardiology cases with 90%+ accuracy",
            icon: "❤️",
            category: "achievement",
            rarity: "epic",
            isEarned: true,
            earnedDate: "2024-01-12",
            requirements: ["10 cardiology cases", "90%+ accuracy"],
          },
          {
            id: "4",
            name: "Speed Demon",
            description: "Complete 5 cases in under 15 minutes each",
            icon: "⚡",
            category: "achievement",
            rarity: "rare",
            isEarned: false,
            progress: 3,
            maxProgress: 5,
            requirements: ["5 cases under 15 minutes"],
          },
          {
            id: "5",
            name: "Perfect Score",
            description: "Achieve 100% accuracy on any case",
            icon: "💯",
            category: "achievement",
            rarity: "epic",
            isEarned: false,
            requirements: ["100% accuracy on any case"],
          },
          {
            id: "6",
            name: "Week Warrior",
            description: "Complete 7 cases in a single week",
            icon: "📅",
            category: "milestone",
            rarity: "rare",
            isEarned: true,
            earnedDate: "2024-01-14",
            requirements: ["7 cases in one week"],
          },
          {
            id: "7",
            name: "Pediatric Pro",
            description: "Complete 8 pediatric cases with 85%+ accuracy",
            icon: "👶",
            category: "achievement",
            rarity: "epic",
            isEarned: false,
            progress: 5,
            maxProgress: 8,
            requirements: ["8 pediatric cases", "85%+ accuracy"],
          },
          {
            id: "8",
            name: "Emergency Responder",
            description: "Complete 5 emergency medicine cases",
            icon: "🚨",
            category: "achievement",
            rarity: "rare",
            isEarned: false,
            progress: 2,
            maxProgress: 5,
            requirements: ["5 emergency medicine cases"],
          },
          {
            id: "9",
            name: "Learning Legend",
            description: "Maintain a 30-day learning streak",
            icon: "👑",
            category: "special",
            rarity: "legendary",
            isEarned: false,
            requirements: ["30-day learning streak"],
          },
          {
            id: "10",
            name: "Case Collector",
            description: "Complete 50 total cases",
            icon: "📚",
            category: "milestone",
            rarity: "epic",
            isEarned: false,
            progress: 18,
            maxProgress: 50,
            requirements: ["50 total cases"],
          },
        ];

        setBadges(mockBadges);
        setFilteredBadges(mockBadges);
      } catch (error) {
        console.error("Failed to load badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBadges();
  }, []);

  useEffect(() => {
    // Filter badges
    let filtered = badges.filter((badge) => {
      const matchesCategory =
        selectedCategory === "all" || badge.category === selectedCategory;

      const matchesRarity =
        selectedRarity === "all" || badge.rarity === selectedRarity;

      const matchesEarnedStatus = !showEarnedOnly || badge.isEarned;

      return matchesCategory && matchesRarity && matchesEarnedStatus;
    });

    setFilteredBadges(filtered);
  }, [badges, selectedCategory, selectedRarity, showEarnedOnly]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800";
      case "rare":
        return "bg-blue-100 text-blue-800";
      case "epic":
        return "bg-purple-100 text-purple-800";
      case "legendary":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-200";
      case "rare":
        return "border-blue-200";
      case "epic":
        return "border-purple-200";
      case "legendary":
        return "border-yellow-200";
      default:
        return "border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "achievement":
        return "🏆";
      case "milestone":
        return "🎯";
      case "special":
        return "⭐";
      default:
        return "📜";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const earnedBadges = badges.filter((badge) => badge.isEarned);
  const totalBadges = badges.length;
  const completionPercentage = Math.round(
    (earnedBadges.length / totalBadges) * 100
  );

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
            Badges & Achievements
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your accomplishments and unlock new achievements
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            {earnedBadges.length} of {totalBadges} badges earned
          </span>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Collection Progress</h2>
          <span className="text-2xl font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-blue-700 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <div className="text-blue-100 text-sm">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {totalBadges - earnedBadges.length}
            </div>
            <div className="text-blue-100 text-sm">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {
                badges.filter((b) => b.rarity === "legendary" && b.isEarned)
                  .length
              }
            </div>
            <div className="text-blue-100 text-sm">Legendary</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="sr-only">
              Filter by category
            </label>
            <select
              id="category"
              name="category"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="achievement">Achievements</option>
              <option value="milestone">Milestones</option>
              <option value="special">Special</option>
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label htmlFor="rarity" className="sr-only">
              Filter by rarity
            </label>
            <select
              id="rarity"
              name="rarity"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          {/* Show Earned Only Toggle */}
          <div className="lg:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(e) => setShowEarnedOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show earned badges only
              </span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border-2 ${
              badge.isEarned
                ? getRarityBorder(badge.rarity)
                : "border-gray-200 opacity-75"
            }`}
          >
            <div className="p-6">
              {/* Badge Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRarityColor(
                      badge.rarity
                    )}`}
                  >
                    {badge.rarity.charAt(0).toUpperCase() +
                      badge.rarity.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">
                    {getCategoryIcon(badge.category)}
                  </span>
                  {badge.isEarned && <span className="text-green-500">✅</span>}
                </div>
              </div>

              {/* Badge Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>

              {/* Progress Bar (for unearned badges) */}
              {!badge.isEarned && badge.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (badge.progress / badge.maxProgress!) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Requirements:
                </h4>
                <ul className="space-y-1">
                  {badge.requirements.map((requirement, reqIndex) => (
                    <li
                      key={reqIndex}
                      className="text-xs text-gray-600 flex items-center"
                    >
                      <span className="mr-2">•</span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Earned Date or Status */}
              <div className="text-center">
                {badge.isEarned ? (
                  <div className="text-sm text-green-600">
                    <div className="font-medium">✅ Earned</div>
                    {badge.earnedDate && (
                      <div className="text-xs text-gray-500">
                        {new Date(badge.earnedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <div className="font-medium">🔒 Locked</div>
                    <div className="text-xs">
                      Complete requirements to unlock
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No badges found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more badges.
          </p>
        </motion.div>
      )}

      {/* Achievement Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Tips for Earning Badges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              🎯 Daily Practice
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete at least one case daily</li>
              <li>• Focus on accuracy over speed initially</li>
              <li>• Review your mistakes and learn from them</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              🏆 Advanced Goals
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try cases from different specialties</li>
              <li>• Challenge yourself with harder difficulties</li>
              <li>• Aim for perfect scores on familiar cases</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Badges;
