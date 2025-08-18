import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EKGWaveform {
  name: string;
  difficulty: number;
  description: string;
  correctAnswer: string;
}

interface EKGGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

const EKGGame: React.FC<EKGGameProps> = ({ onComplete, onClose }) => {
  const [currentWaveform, setCurrentWaveform] = useState<EKGWaveform | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isGameActive, setIsGameActive] = useState(true);

  const waveforms: EKGWaveform[] = [
    {
      name: 'Normal Sinus Rhythm',
      difficulty: 1,
      description: 'Regular rhythm with normal P waves, QRS complexes, and T waves',
      correctAnswer: 'normal'
    },
    {
      name: 'Sinus Tachycardia',
      difficulty: 2,
      description: 'Regular rhythm but heart rate > 100 bpm',
      correctAnswer: 'tachycardia'
    },
    {
      name: 'Atrial Fibrillation',
      difficulty: 3,
      description: 'Irregular rhythm with no discernible P waves',
      correctAnswer: 'afib'
    },
    {
      name: 'Ventricular Tachycardia',
      difficulty: 4,
      description: 'Wide QRS complexes with rapid heart rate',
      correctAnswer: 'vtach'
    }
  ];

  useEffect(() => {
    // Select a random waveform
    const randomWaveform = waveforms[Math.floor(Math.random() * waveforms.length)];
    setCurrentWaveform(randomWaveform);

    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameActive(false);
          onComplete(0); // Time's up, no score
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (!currentWaveform || !userAnswer) return;

    const isCorrect = userAnswer.toLowerCase() === currentWaveform.correctAnswer.toLowerCase();
    
    let score = 0;
    if (isCorrect) {
      // Base score + time bonus + difficulty bonus
      score = 100 + Math.max(0, timeRemaining * 2) + (currentWaveform.difficulty * 25);
    }
    
    setIsGameActive(false);
    onComplete(score);
  };

  const handleClose = () => {
    onClose();
  };

  if (!currentWaveform) {
    return (
      <div className="bg-white text-black p-6 rounded-lg max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading EKG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-6 rounded-lg max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">EKG Interpretation</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className="text-lg font-semibold">
          Time remaining: <span className={timeRemaining <= 10 ? 'text-red-600' : 'text-blue-600'}>
            {timeRemaining}s
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeRemaining <= 10 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(timeRemaining / 30) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* EKG Display */}
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
          <div className="text-center text-gray-600 mb-2">EKG Waveform</div>
          <div className="h-32 bg-white border border-gray-300 rounded flex items-center justify-center">
            <div className="text-4xl text-gray-400">📈</div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {currentWaveform.description}
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          What rhythm is this?
        </label>
        <div className="space-y-2">
          {['normal', 'tachycardia', 'afib', 'vtach'].map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="ekg-answer"
                value={option}
                checked={userAnswer === option}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="mr-2"
                disabled={!isGameActive}
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!userAnswer || !isGameActive}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isGameActive ? 'Submit Answer' : 'Time\'s Up!'}
      </button>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Analyze the EKG waveform and select the correct rhythm.</p>
        <p>Faster answers earn bonus points!</p>
      </div>
    </div>
  );
};

export default EKGGame;
