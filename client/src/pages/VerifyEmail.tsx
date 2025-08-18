import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error" | "expired"
  >("verifying");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Simulate API call to verify email
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For demo purposes, assume success
        setVerificationStatus("success");
      } catch (error) {
        setVerificationStatus("error");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
      setIsLoading(false);
    }
  }, [token]);

  const getStatusContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return {
          icon: "⏳",
          title: "Verifying Your Email",
          message: "Please wait while we verify your email address...",
          color: "text-blue-600",
        };
      case "success":
        return {
          icon: "✅",
          title: "Email Verified Successfully!",
          message:
            "Your email has been verified. You can now sign in to your account.",
          color: "text-green-600",
        };
      case "error":
        return {
          icon: "❌",
          title: "Verification Failed",
          message:
            "We couldn't verify your email. The link may be invalid or expired.",
          color: "text-red-600",
        };
      case "expired":
        return {
          icon: "⏰",
          title: "Verification Link Expired",
          message:
            "Your verification link has expired. Please request a new one.",
          color: "text-yellow-600",
        };
      default:
        return {
          icon: "❓",
          title: "Unknown Status",
          message: "Something went wrong. Please try again.",
          color: "text-gray-600",
        };
    }
  };

  const statusContent = getStatusContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Verifying Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className={`text-6xl mb-4 ${statusContent.color}`}>
            {statusContent.icon}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {statusContent.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{statusContent.message}</p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {verificationStatus === "success" && (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Welcome to the Medical Training Platform! Your account is now
                  active.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800">
                    🎉 You can now access all features and start your medical
                    training journey!
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In to Your Account
              </Link>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Don't worry! You can still verify your email or create a new
                  account.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">
                    💡 If you're having trouble, check your email for the
                    verification link or contact support.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Go to Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === "expired" && (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Verification links expire for security reasons. You can
                  request a new one.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    🔐 For your security, verification links expire after 24
                    hours.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Request New Verification Email
                </button>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/contact"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
