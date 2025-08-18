import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import SubscriptionUpgradeTrigger from "../components/SubscriptionUpgradeTrigger";

interface MedicalCase {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  estimatedTime: number;
  patientAge: number;
  patientGender: string;
  isCompleted?: boolean;
  bestScore?: number;
  tags: string[];
}

const CaseLibrary: React.FC = () => {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<MedicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");

  const difficulties = useMemo(
    () => ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    []
  );
  const categories = useMemo(
    () => [
      "Cardiology",
      "Endocrinology",
      "Emergency Medicine",
      "Pediatrics",
      "Internal Medicine",
      "Surgery",
      "Psychiatry",
      "Obstetrics & Gynecology",
    ],
    []
  );

  useEffect(() => {
    // Fetch cases from backend API
    const loadCases = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/cases");
        const data = response.data;

        // Transform backend data to match our interface
        const transformedCases: MedicalCase[] = data.map((caseData: any) => ({
          id: caseData.id,
          title: caseData.title,
          description: caseData.description,
          difficulty: caseData.difficulty,
          category: caseData.category,
          estimatedTime: caseData.estimatedDuration || 30,
          patientAge: caseData.content?.patient_info?.age || 0,
          patientGender: caseData.content?.patient_info?.gender || "Unknown",
          isCompleted: false, // This will be updated based on user progress
          bestScore: 0, // This will be updated based on user progress
          tags: caseData.tags || [],
        }));

        setCases(transformedCases);
        setFilteredCases(transformedCases);
        console.log("Loaded cases from backend:", transformedCases);
      } catch (error) {
        console.error("Failed to load cases from backend:", error);
        // Fallback to mock data if backend fails
        const mockCases: MedicalCase[] = [
          {
            id: "fallback-1",
            title: "Hypertension Management - John Smith",
            description:
              "A series of visits for John Smith, focusing on managing his hypertension and observing trends.",
            difficulty: "BEGINNER",
            category: "Cardiology",
            estimatedTime: 15,
            patientAge: 45,
            patientGender: "Male",
            isCompleted: false,
            bestScore: 0,
            tags: ["hypertension", "blood pressure", "lifestyle"],
          },
          {
            id: "fallback-2",
            title: "Diabetes Management - Maria Rodriguez",
            description:
              "A diabetes management case with blood glucose monitoring and lifestyle counseling",
            difficulty: "INTERMEDIATE",
            category: "Endocrinology",
            estimatedTime: 25,
            patientAge: 58,
            patientGender: "Female",
            isCompleted: false,
            bestScore: 0,
            tags: ["diabetes", "blood glucose", "lifestyle"],
          },
        ];
        setCases(mockCases);
        setFilteredCases(mockCases);
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  useEffect(() => {
    // Filter and sort cases
    let filtered = cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        caseItem.difficulty === selectedDifficulty;

      const matchesCategory =
        selectedCategory === "all" || caseItem.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });

    // Sort cases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "difficulty":
          return (
            difficulties.indexOf(a.difficulty) -
            difficulties.indexOf(b.difficulty)
          );
        case "category":
          return a.category.localeCompare(b.category);
        case "estimatedTime":
          return a.estimatedTime - b.estimatedTime;
        case "patientAge":
          return a.patientAge - b.patientAge;
        default:
          return 0;
      }
    });

    setFilteredCases(filtered);
  }, [cases, searchTerm, selectedDifficulty, selectedCategory, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "🟢";
      case "INTERMEDIATE":
        return "🟡";
      case "ADVANCED":
        return "🔴";
      default:
        return "⚪";
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Library</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and practice with medical case scenarios
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            {filteredCases.length} of {cases.length} cases
          </span>
        </div>
      </motion.div>

      {/* Subscription Upgrade Trigger */}
      <SubscriptionUpgradeTrigger
        triggerType="premium-feature"
        message="Upgrade to access unlimited cases and advanced features"
        className="mb-6"
      />

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="sr-only">
              Search cases
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search cases, descriptions, or tags..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label htmlFor="difficulty" className="sr-only">
              Filter by difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { value: "title", label: "Title" },
              { value: "difficulty", label: "Difficulty" },
              { value: "category", label: "Category" },
              { value: "estimatedTime", label: "Time" },
              { value: "patientAge", label: "Age" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  sortBy === option.value
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cases Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCases.map((caseItem, index) => (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={getDifficultyIcon(caseItem.difficulty)}
                  ></span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                      caseItem.difficulty
                    )}`}
                  >
                    {caseItem.difficulty.charAt(0) +
                      caseItem.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>
                {caseItem.isCompleted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Completed
                  </span>
                )}
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {caseItem.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {caseItem.description}
              </p>

              {/* Case Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🏥</span>
                  <span className="font-medium">{caseItem.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>{caseItem.estimatedTime} minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👤</span>
                  <span>
                    {caseItem.patientAge} year old {caseItem.patientGender}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {caseItem.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {caseItem.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                    +{caseItem.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Best Score */}
              {caseItem.isCompleted && caseItem.bestScore && (
                <div className="mb-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Best Score
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {caseItem.bestScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Link
                to={`/simulation/${caseItem.id}`}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium transition-colors ${
                  caseItem.isCompleted
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {caseItem.isCompleted ? "Practice Again" : "Start Case"}
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No cases found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find more cases.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CaseLibrary;
