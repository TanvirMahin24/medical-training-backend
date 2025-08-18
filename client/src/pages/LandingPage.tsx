import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Medical Training Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Master Medical Skills Through
              <span className="block text-blue-200">
                Interactive Simulations
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Enhance your clinical decision-making with realistic patient
              scenarios, comprehensive feedback, and progress tracking designed
              for healthcare professionals.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Our Platform?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive training solutions designed for modern healthcare
              education
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Realistic Scenarios",
                description:
                  "Practice with authentic patient cases that mirror real-world clinical situations.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description:
                  "Monitor your performance with detailed analytics and improvement suggestions.",
              },
              {
                icon: "🏆",
                title: "Achievement System",
                description:
                  "Earn badges and certificates as you master different medical procedures.",
              },
              {
                icon: "💡",
                title: "Instant Feedback",
                description:
                  "Get immediate feedback on your decisions to accelerate learning.",
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                description:
                  "Access training modules anywhere, anytime with our responsive platform.",
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                description:
                  "Your data and progress are protected with enterprise-grade security.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Transform Your Medical Training?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of healthcare professionals already using our
              platform
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Your Free Trial Today
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Medical Training Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
