import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  criteria?: any;
  category?: "achievement" | "milestone" | "special";
  rarity?: "common" | "rare" | "epic" | "legendary";
  isEarned?: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  requirements?: string[];
}

const Badges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filteredBadges, setFilteredBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setIsLoading(true);
        const [allBadgesRes, myBadgesRes] = await Promise.all([
          api.get("/badges"),
          api.get("/badges/me"),
        ]);

        const allBadges: Badge[] = allBadgesRes.data || [];
        const myBadges: any[] = myBadgesRes.data || [];
        const myBadgeIds = new Set(myBadges.map((b) => b.id));

        const merged = allBadges.map((b) => ({
          ...b,
          isEarned: myBadgeIds.has(b.id),
          earnedDate: myBadges.find((mb) => mb.id === b.id)?.earnedAt,
          // criteria can include category/rarity if you want to surface later
        }));

        setBadges(merged);
        setFilteredBadges(merged);
      } catch (error) {
        console.error("Failed to load badges:", error);
        setBadges([]);
        setFilteredBadges([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBadges();
  }, []);

  useEffect(() => {
    let filtered = badges.filter((badge) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (badge as any).category === selectedCategory;
      const matchesRarity =
        selectedRarity === "all" || (badge as any).rarity === selectedRarity;
      const matchesEarnedStatus = !showEarnedOnly || badge.isEarned;
      return matchesCategory && matchesRarity && matchesEarnedStatus;
    });

    setFilteredBadges(filtered);
  }, [badges, selectedCategory, selectedRarity, showEarnedOnly]);

  const getRarityColor = (rarity?: string) => {
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

  const getRarityBorder = (rarity?: string) => {
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

  const getCategoryIcon = (category?: string) => {
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
  const completionPercentage = totalBadges
    ? Math.round((earnedBadges.length / totalBadges) * 100)
    : 0;

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
              {/* Badge Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>

              {/* Requirements */}
              {badge.criteria && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Criteria:
                  </h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(badge.criteria, null, 2)}
                  </pre>
                </div>
              )}

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
    </div>
  );
};

export default Badges;
