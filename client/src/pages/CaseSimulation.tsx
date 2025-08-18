import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface CaseStep {
  id: string;
  type:
    | "patient_info"
    | "symptoms"
    | "examination"
    | "diagnosis"
    | "treatment"
    | "outcome";
  title: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  isCompleted: boolean;
}

interface MedicalCase {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    chiefComplaint: string;
    vitalSigns: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      respiratoryRate: string;
      oxygenSaturation: string;
    };
  };
  steps: CaseStep[];
  estimatedTime: number;
}

const CaseSimulation: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [currentCase, setCurrentCase] = useState<MedicalCase | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Simulate loading case data
    const loadCase = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock case data for demonstration
        const mockCase: MedicalCase = {
          id: caseId || "1",
          title: "Hypertension Management - John Smith",
          description:
            "A 45-year-old male presents with elevated blood pressure readings over the past three visits.",
          difficulty: "BEGINNER",
          category: "Cardiology",
          patientInfo: {
            name: "John Smith",
            age: 45,
            gender: "Male",
            chiefComplaint: "Elevated blood pressure readings",
            vitalSigns: {
              bloodPressure: "150/95 mmHg",
              heartRate: "88 bpm",
              temperature: "98.6°F (37°C)",
              respiratoryRate: "16/min",
              oxygenSaturation: "98%",
            },
          },
          steps: [
            {
              id: "1",
              type: "patient_info",
              title: "Patient Information",
              content:
                "Review the patient's basic information and vital signs.",
              isCompleted: false,
            },
            {
              id: "2",
              type: "symptoms",
              title: "Symptom Assessment",
              content:
                "What additional symptoms should you assess in this patient?",
              options: [
                "Headache and dizziness",
                "Chest pain and shortness of breath",
                "Fatigue and sleep disturbances",
                "All of the above",
              ],
              correctAnswer: "All of the above",
              explanation:
                "Hypertension can present with various symptoms including headache, dizziness, chest pain, shortness of breath, fatigue, and sleep disturbances. A comprehensive assessment is important.",
              isCompleted: false,
            },
            {
              id: "3",
              type: "examination",
              title: "Physical Examination",
              content: "What physical examination findings would you look for?",
              options: [
                "Fundoscopic examination for retinal changes",
                "Cardiac auscultation for murmurs",
                "Peripheral pulses and edema assessment",
                "All of the above",
              ],
              correctAnswer: "All of the above",
              explanation:
                "A thorough physical examination should include fundoscopic examination for hypertensive retinopathy, cardiac auscultation for murmurs or gallops, and assessment of peripheral pulses and edema.",
              isCompleted: false,
            },
            {
              id: "4",
              type: "diagnosis",
              title: "Diagnosis",
              content:
                "Based on the information, what is the most likely diagnosis?",
              options: [
                "Primary hypertension",
                "Secondary hypertension",
                "White coat hypertension",
                "Malignant hypertension",
              ],
              correctAnswer: "Primary hypertension",
              explanation:
                "Given the patient's age, gender, and presentation, primary (essential) hypertension is the most likely diagnosis. Secondary causes should be considered but are less common.",
              isCompleted: false,
            },
            {
              id: "5",
              type: "treatment",
              title: "Treatment Plan",
              content: "What would be your initial treatment approach?",
              options: [
                "Immediate medication prescription",
                "Lifestyle modifications first",
                "Referral to cardiologist",
                "Hospital admission",
              ],
              correctAnswer: "Lifestyle modifications first",
              explanation:
                "For stage 1 hypertension without complications, lifestyle modifications (diet, exercise, weight loss, salt reduction) should be the first approach, with medication added if needed.",
              isCompleted: false,
            },
            {
              id: "6",
              type: "outcome",
              title: "Follow-up Plan",
              content: "What follow-up schedule would you recommend?",
              options: [
                "Monthly visits for 3 months",
                "Weekly visits for 1 month",
                "3-month follow-up",
                "6-month follow-up",
              ],
              correctAnswer: "Monthly visits for 3 months",
              explanation:
                "Monthly follow-up for 3 months allows for monitoring of blood pressure response to lifestyle changes and adjustment of treatment plan as needed.",
              isCompleted: false,
            },
          ],
          estimatedTime: 15,
        };

        setCurrentCase(mockCase);
        setStartTime(new Date());
      } catch (error) {
        console.error("Failed to load case:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  const handleAnswer = (stepId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [stepId]: answer }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < (currentCase?.steps.length || 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Case completed, calculate score
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!currentCase) return;

    let correctAnswers = 0;
    const totalQuestions = currentCase.steps.filter(
      (step) => step.options
    ).length;

    currentCase.steps.forEach((step) => {
      if (step.options && step.correctAnswer) {
        if (userAnswers[step.id] === step.correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "patient_info":
        return "👤";
      case "symptoms":
        return "🩺";
      case "examination":
        return "🔍";
      case "diagnosis":
        return "📋";
      case "treatment":
        return "💊";
      case "outcome":
        return "✅";
      default:
        return "📝";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Case not found.</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Case Completed!
              </h1>
              <p className="text-gray-600">
                You've successfully completed "{currentCase.title}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{score}%</div>
                <div className="text-sm text-blue-800">Final Score</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-green-800">Time Taken</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {currentCase.steps.length}
                </div>
                <div className="text-sm text-purple-800">Steps Completed</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Performance Summary
              </h2>
              {currentCase.steps.map((step, index) => {
                if (!step.options) return null;

                const userAnswer = userAnswers[step.id];
                const isCorrect = userAnswer === step.correctAnswer;

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span
                        className={`text-lg ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect ? "✅" : "❌"}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Step {index + 1}: {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {step.content}
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Your answer:</span>{" "}
                          {userAnswer}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm mt-1">
                            <span className="font-medium text-green-700">
                              Correct answer:
                            </span>{" "}
                            {step.correctAnswer}
                          </div>
                        )}
                        {step.explanation && (
                          <div className="text-sm mt-2 p-2 bg-white rounded border">
                            <span className="font-medium">Explanation:</span>{" "}
                            {step.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentStepIndex(0);
                  setUserAnswers({});
                  setScore(0);
                  setStartTime(new Date());
                  setElapsedTime(0);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate("/cases")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Back to Cases
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentStep = currentCase.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentCase.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/cases")}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Cases
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentCase.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentCase.category} • {currentCase.difficulty}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Time: {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {currentCase.steps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              {/* Step Header */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">
                  {getStepIcon(currentStep.type)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {currentCase.steps.length}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentStep.content}
                </p>
              </div>

              {/* Patient Information Display */}
              {currentStep.type === "patient_info" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-3">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Name:</span>{" "}
                        {currentCase.patientInfo.name}
                      </p>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Age:</span>{" "}
                        {currentCase.patientInfo.age} years
                      </p>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Gender:</span>{" "}
                        {currentCase.patientInfo.gender}
                      </p>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Chief Complaint:</span>{" "}
                        {currentCase.patientInfo.chiefComplaint}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">
                        Vital Signs
                      </h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p>
                          BP: {currentCase.patientInfo.vitalSigns.bloodPressure}
                        </p>
                        <p>
                          HR: {currentCase.patientInfo.vitalSigns.heartRate}
                        </p>
                        <p>
                          Temp: {currentCase.patientInfo.vitalSigns.temperature}
                        </p>
                        <p>
                          RR:{" "}
                          {currentCase.patientInfo.vitalSigns.respiratoryRate}
                        </p>
                        <p>
                          O2:{" "}
                          {currentCase.patientInfo.vitalSigns.oxygenSaturation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Choice Options */}
              {currentStep.options && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Select your answer:
                  </h3>
                  {currentStep.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        userAnswers[currentStep.id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`step-${currentStep.id}`}
                        value={option}
                        checked={userAnswers[currentStep.id] === option}
                        onChange={() => handleAnswer(currentStep.id, option)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStepIndex === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStep.options && !userAnswers[currentStep.id]}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStepIndex === currentCase.steps.length - 1
                    ? "Complete Case"
                    : "Next"}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-gray-900 mb-4">Case Overview</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">
                    {currentCase.category}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Difficulty:</span>
                  <span className="ml-2 text-gray-600">
                    {currentCase.difficulty}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Estimated Time:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {currentCase.estimatedTime} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-gray-900 mb-4">Steps</h3>
              <div className="space-y-2">
                {currentCase.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      index === currentStepIndex
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{getStepIcon(step.type)}</span>
                      <span className="truncate">{step.title}</span>
                      {userAnswers[step.id] && (
                        <span className="text-green-600">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-gray-900 mb-4">Timer</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-600">Elapsed Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSimulation;
