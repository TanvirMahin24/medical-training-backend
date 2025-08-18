import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EndShiftState {
  finalScore: number;
  completed: number;
  total: number;
}

const EndShift: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as EndShiftState;

  if (!state) {
    navigate('/dashboard');
    return null;
  }

  const { finalScore, completed, total } = state;
  const completionRate = Math.round((completed / total) * 100);
  const scorePercentage = Math.round((finalScore / (total * 100)) * 100);

  const getScoreMessage = () => {
    if (scorePercentage >= 90) return "Outstanding performance! You're a natural!";
    if (scorePercentage >= 80) return "Great job! You handled the case very well.";
    if (scorePercentage >= 70) return "Good work! You completed most tasks correctly.";
    if (scorePercentage >= 60) return "Not bad! You have room for improvement.";
    return "Keep practicing! Review the case to improve your skills.";
  };

  const getCompletionMessage = () => {
    if (completionRate === 100) return "Perfect! You completed all tasks!";
    if (completionRate >= 80) return "Well done! You completed most tasks.";
    if (completionRate >= 60) return "Good effort! You completed many tasks.";
    return "You completed some tasks. Keep practicing!";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shift Completed!
            </h1>
            <p className="text-gray-600">
              You've successfully completed your medical training simulation
            </p>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{finalScore}</div>
              <div className="text-sm text-blue-800">Final Score</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
              <div className="text-sm text-green-800">Completion Rate</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {completed}/{total}
              </div>
              <div className="text-sm text-purple-800">Tasks Completed</div>
            </div>
          </div>

          {/* Performance Messages */}
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Score Analysis</h3>
              <p className="text-blue-800">{getScoreMessage()}</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Task Completion</h3>
              <p className="text-green-800">{getCompletionMessage()}</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Task Completion</span>
                <span className="text-gray-600">{completed} out of {total} tasks</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Score per Task</span>
                <span className="text-gray-600">{Math.round(finalScore / completed)} points</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Overall Performance</span>
                <span className="text-gray-600">{scorePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/cases')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Practice Another Case
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              View Progress
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EndShift;
