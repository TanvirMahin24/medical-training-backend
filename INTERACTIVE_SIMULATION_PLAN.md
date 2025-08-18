# Interactive Case Simulation Engine - Implementation Plan

## Overview

Based on the analysis of the reference ShadowClinic frontend, the current medical training platform is missing a crucial interactive simulation engine. This document outlines the detailed implementation plan to transform the basic case simulation into an engaging, game-like medical training experience.

## Current State Analysis

### What's Missing from Current Implementation

1. **Static Case Flow**: Current `CaseSimulation.tsx` only shows step-by-step text-based scenarios
2. **No Interactive Environment**: Missing clinic layout, player movement, interactive objects
3. **Limited Engagement**: No real-time scoring, dynamic task progression, or consequences
4. **Basic UI**: Simple forms instead of immersive simulation experience

### Reference Implementation Features (ShadowClinic)

1. **Top-down Clinic Layout**: 2D clinic environment with interactive objects
2. **Player Movement System**: WASD controls with smooth animation
3. **Dynamic Task Progression**: Tasks unlock based on previous actions
4. **Interactive Objects**: Front desk, exam rooms, medical equipment, staff NPCs
5. **Patient Interaction System**: Dialogue choices with consequences
6. **Real-time Scoring**: Points for correct actions, penalties for mistakes
7. **Mini-games**: EKG interpretation, vital signs recording

## Implementation Plan

### Phase 1: Enhanced Database Schema

#### 1.1 Update MedicalCase Model

```prisma
model MedicalCase {
  id                String        @id @default(uuid())
  title             String
  description       String
  difficulty        CaseDifficulty
  category          String
  tags              String[]
  estimatedDuration Int
  content           Json          // Enhanced JSON structure
  isActive          Boolean       @default(true)
  isPublished       Boolean       @default(false)
  publishedAt       DateTime?
  createdBy         String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  userProgress      UserProgress[]
  simulationSessions SimulationSession[]

  @@map("medical_cases")
}

// New model for simulation sessions
model SimulationSession {
  id                String   @id @default(uuid())
  userId            String
  caseId            String
  currentVisit      Int      @default(1)
  currentTask       String?
  playerPosition    Json     // {x: number, y: number}
  gameState         Json     // Current simulation state
  score             Int      @default(0)
  timeSpent         Int      @default(0) // in seconds
  completedTasks    String[] // Array of completed task IDs
  patientState      String   // waiting, following, in-room, etc.
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  case              MedicalCase  @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@unique([userId, caseId])
  @@map("simulation_sessions")
}
```

#### 1.2 Enhanced Content JSON Structure

```json
{
  "clinic_layout": {
    "width": 800,
    "height": 600,
    "interactable_objects": [
      {
        "id": "comp-station",
        "name": "Comp Station",
        "x": 400,
        "y": 150,
        "width": 80,
        "height": 50,
        "type": "computer",
        "interactions": ["chart_vitals", "record_data"]
      },
      {
        "id": "front-desk",
        "name": "Front Desk",
        "x": 100,
        "y": 350,
        "width": 150,
        "height": 60,
        "type": "check_in",
        "interactions": ["patient_check_in"]
      },
      {
        "id": "exam-room-1",
        "name": "Exam Room 1",
        "x": 700,
        "y": 100,
        "width": 100,
        "height": 120,
        "type": "exam_room",
        "status": "available",
        "interactions": ["room_patient"]
      }
    ],
    "npcs": [
      {
        "id": "doctor-adams",
        "name": "Dr. Adams",
        "x": 500,
        "y": 300,
        "width": 40,
        "height": 40,
        "type": "doctor",
        "interactions": ["report_vitals", "consultation"]
      }
    ]
  },
  "patient_info": {
    "id": "patient-smith",
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "chief_complaint": "Hypertension follow-up",
    "medical_history": "Diagnosed with hypertension 2 years ago...",
    "current_medications": ["Lisinopril 10mg daily"],
    "allergies": ["None"]
  },
  "visits": [
    {
      "visit_number": 1,
      "date": "2025-01-15",
      "main_complaint": "Routine check-up for hypertension",
      "expected_vitals": {
        "bloodPressure": "120/80",
        "heartRate": "72",
        "temperature": "98.6",
        "respiratoryRate": "16"
      },
      "medical_history": {
        "main_complaint": "Routine check-up",
        "allergies": ["None"],
        "medications": ["Lisinopril 10mg daily"]
      },
      "tasks_for_visit": [
        {
          "id": "task-check-in",
          "description": "Check in John Smith at the front desk.",
          "type": "front_desk_check_in",
          "expected_patient_id": "patient-smith",
          "dialogue_options": [],
          "score_impact": 50,
          "unlocks": ["task-greet"]
        },
        {
          "id": "task-greet",
          "description": "Greet John Smith and escort him to an empty exam room.",
          "type": "patient_interaction",
          "patient_id": "patient-smith",
          "location": "waiting-room",
          "dialogue_options": [
            {
              "text": "Hello, Mr. Smith? My name is Alex, and I'll be your Medical Assistant today. Please follow me.",
              "score_impact": 50,
              "consequence": "patient_follows",
              "unlocks": ["task-room"]
            },
            {
              "text": "You're next. Come on back.",
              "score_impact": -50,
              "consequence": "patient_rude_but_follows",
              "patient_response": "That's a bit rude, but okay.",
              "unlocks": ["task-room"]
            }
          ]
        }
      ]
    }
  ],
  "patient_arrivals": [
    {
      "patient_id": "patient-smith",
      "arrival_time": "09:00",
      "visit_number": 1
    }
  ]
}
```

### Phase 2: Backend Implementation

#### 2.1 Enhanced Cases Controller

```typescript
// cases.controller.ts
@Controller("cases")
export class CasesController {
  @Get()
  async getAllCases() {
    return this.casesService.getAllCases();
  }

  @Get(":id")
  async getCaseById(@Param("id") id: string) {
    return this.casesService.getCaseById(id);
  }

  @Get(":id/simulation-data")
  async getSimulationData(@Param("id") id: string) {
    return this.casesService.getSimulationData(id);
  }

  @Post(":id/start-simulation")
  async startSimulation(
    @Param("id") caseId: string,
    @Body() startData: StartSimulationDto,
    @Request() req: any
  ) {
    return this.casesService.startSimulation(caseId, req.user.id, startData);
  }

  @Put(":id/simulation-progress")
  async updateSimulationProgress(
    @Param("id") caseId: string,
    @Body() progressData: UpdateSimulationProgressDto,
    @Request() req: any
  ) {
    return this.casesService.updateSimulationProgress(
      caseId,
      req.user.id,
      progressData
    );
  }

  @Post(":id/complete-task")
  async completeTask(
    @Param("id") caseId: string,
    @Body() taskData: CompleteTaskDto,
    @Request() req: any
  ) {
    return this.casesService.completeTask(caseId, req.user.id, taskData);
  }
}
```

#### 2.2 Simulation Service

```typescript
// simulation.service.ts
@Injectable()
export class SimulationService {
  async startSimulation(
    caseId: string,
    userId: string,
    startData: StartSimulationDto
  ) {
    const caseData = await this.prisma.medicalCase.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException("Case not found");
    }

    // Create or update simulation session
    const session = await this.prisma.simulationSession.upsert({
      where: {
        userId_caseId: { userId, caseId },
      },
      update: {
        currentVisit: 1,
        currentTask: null,
        playerPosition: { x: 50, y: 50 },
        gameState: { isActive: true },
        score: 0,
        timeSpent: 0,
        completedTasks: [],
        patientState: "waiting",
        isActive: true,
      },
      create: {
        userId,
        caseId,
        currentVisit: 1,
        currentTask: null,
        playerPosition: { x: 50, y: 50 },
        gameState: { isActive: true },
        score: 0,
        timeSpent: 0,
        completedTasks: [],
        patientState: "waiting",
        isActive: true,
      },
    });

    return {
      session,
      caseData: caseData.content,
      initialTasks: this.getInitialTasks(caseData.content),
    };
  }

  async completeTask(
    caseId: string,
    userId: string,
    taskData: CompleteTaskDto
  ) {
    const session = await this.prisma.simulationSession.findUnique({
      where: { userId_caseId: { userId, caseId } },
    });

    if (!session) {
      throw new NotFoundException("Simulation session not found");
    }

    // Calculate score based on task completion
    const score = this.calculateTaskScore(taskData);

    // Update session
    const updatedSession = await this.prisma.simulationSession.update({
      where: { userId_caseId: { userId, caseId } },
      data: {
        score: session.score + score,
        completedTasks: [...session.completedTasks, taskData.taskId],
        currentTask: this.getNextTask(session, taskData.taskId),
      },
    });

    return {
      session: updatedSession,
      scoreEarned: score,
      nextTask: updatedSession.currentTask,
    };
  }

  private calculateTaskScore(taskData: CompleteTaskDto): number {
    let baseScore = 100;

    // Apply time bonuses/penalties
    if (taskData.timeSpent < taskData.expectedTime) {
      baseScore += 50; // Time bonus
    } else if (taskData.timeSpent > taskData.expectedTime * 1.5) {
      baseScore -= 25; // Time penalty
    }

    // Apply accuracy bonuses/penalties
    if (taskData.accuracy > 0.9) {
      baseScore += 25; // High accuracy bonus
    } else if (taskData.accuracy < 0.7) {
      baseScore -= 50; // Low accuracy penalty
    }

    return Math.max(0, baseScore);
  }
}
```

### Phase 3: Frontend Implementation

#### 3.1 Enhanced CaseSimulation Component

```typescript
// CaseSimulation.tsx - Enhanced version
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../hooks/useSimulationStore';

interface InteractiveObject {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  status?: string;
  interactions: string[];
}

interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  location?: string;
}

interface SimulationState {
  playerPosition: { x: number; y: number };
  score: number;
  currentTask: string | null;
  completedTasks: string[];
  patientState: string;
  gameTime: number;
  isShiftOver: boolean;
}

const CaseSimulation: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    playerPosition: { x: 50, y: 50 },
    score: 0,
    currentTask: null,
    completedTasks: [],
    patientState: 'waiting',
    gameTime: new Date().setHours(9, 0, 0, 0),
    isShiftOver: false
  });

  const [interactableObjects, setInteractableObjects] = useState<InteractiveObject[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [canInteract, setCanInteract] = useState<InteractiveObject | NPC | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
  const [caseData, setCaseData] = useState<any>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Game loop using requestAnimationFrame
  const useAnimationFrame = (callback: (deltaTime: number) => void, isPaused: boolean) => {
    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();
    const callbackRef = useRef(callback);

    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
      const animate = (time: number) => {
        if (!isPaused) {
          if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callbackRef.current(deltaTime);
          }
          previousTimeRef.current = time;
        }
        requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }, [isPaused]);
  };

  // Player movement
  useAnimationFrame((deltaTime) => {
    const speed = 150;
    const moveDistance = speed * (deltaTime / 1000);

    setSimulationState(prev => {
      let newX = prev.playerPosition.x;
      let newY = prev.playerPosition.y;

      if (keysPressed['w']) newY -= moveDistance;
      if (keysPressed['s']) newY += moveDistance;
      if (keysPressed['a']) newX -= moveDistance;
      if (keysPressed['d']) newX += moveDistance;

      // Boundary checking
      if (gameAreaRef.current) {
        const gameArea = gameAreaRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, gameArea.width - 40));
        newY = Math.max(0, Math.min(newY, gameArea.height - 40));
      }

      return {
        ...prev,
        playerPosition: { x: newX, y: newY }
      };
    });
  }, isModalOpen);

  // Load case data and initialize simulation
  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}/simulation-data`);
        const data = await response.json();

        setCaseData(data);
        setInteractableObjects(data.clinic_layout.interactable_objects);
        setNpcs(data.clinic_layout.npcs);

        // Start simulation session
        await fetch(`/api/cases/${caseId}/start-simulation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime: new Date().toISOString() })
        });
      } catch (error) {
        console.error('Failed to load simulation:', error);
      }
    };

    if (caseId) {
      loadSimulation();
    }
  }, [caseId]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isModalOpen) return;

    if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
      setKeysPressed(keys => ({ ...keys, [e.key.toLowerCase()]: true }));
    }

    if (e.key.toLowerCase() === 'e' && canInteract && !isModalOpen) {
      handleInteraction(canInteract);
    }
  }, [canInteract, isModalOpen]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (isModalOpen) return;
    setKeysPressed(keys => ({ ...keys, [e.key.toLowerCase()]: false }));
  }, [isModalOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Interaction detection
  useEffect(() => {
    const interaction = getInteraction();
    setCanInteract(interaction);

    if (isModalOpen && canInteract) {
      const playerCenterX = simulationState.playerPosition.x + 20;
      const playerCenterY = simulationState.playerPosition.y + 20;
      const objectCenterX = canInteract.x + (canInteract.width || 0) / 2;
      const objectCenterY = canInteract.y + (canInteract.height || 0) / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - objectCenterX, 2) +
        Math.pow(playerCenterY - objectCenterY, 2)
      );

      if (distance > 60) {
        setIsModalOpen(false);
      }
    }
  }, [simulationState.playerPosition, interactableObjects, npcs, isModalOpen, canInteract]);

  const getInteraction = useCallback(() => {
    const playerCenterX = simulationState.playerPosition.x + 20;
    const playerCenterY = simulationState.playerPosition.y + 20;

    const allInteractables = [...interactableObjects, ...npcs];

    for (const object of allInteractables) {
      const objectCenterX = object.x + (object.width || 0) / 2;
      const objectCenterY = object.y + (object.height || 0) / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - objectCenterX, 2) +
        Math.pow(playerCenterY - objectCenterY, 2)
      );

      const objectRadius = Math.sqrt(Math.pow(object.width || 0, 2) + Math.pow(object.height || 0, 2)) / 2;
      const interactionThreshold = objectRadius + 15;

      if (distance < interactionThreshold) {
        return object;
      }
    }

    return null;
  }, [simulationState.playerPosition, interactableObjects, npcs]);

  const handleInteraction = async (object: InteractiveObject | NPC) => {
    const content = getModalContent(object);
    if (content) {
      setIsModalOpen(true);
    }
  };

  const getModalContent = (object: InteractiveObject | NPC) => {
    if (!caseData || !caseData.visits) return null;

    const currentVisit = caseData.visits[0]; // Assuming first visit for now
    const currentTask = currentVisit.tasks_for_visit.find((t: any) =>
      !simulationState.completedTasks.includes(t.id)
    );

    switch (object.type) {
      case 'check_in':
        if (currentTask?.type === 'front_desk_check_in') {
          return <CheckInModal task={currentTask} onComplete={handleTaskComplete} />;
        }
        break;

      case 'patient_interaction':
        if (currentTask?.type === 'patient_interaction') {
          return <PatientInteractionModal task={currentTask} onComplete={handleTaskComplete} />;
        }
        break;

      case 'computer':
        if (currentTask?.type === 'chart_vitals') {
          return <ChartingModal task={currentTask} onComplete={handleTaskComplete} />;
        }
        break;

      case 'exam_room':
        if (currentTask?.type === 'room_patient') {
          return <RoomPatientModal task={currentTask} onComplete={handleTaskComplete} />;
        }
        break;
    }

    return null;
  };

  const handleTaskComplete = async (taskId: string, score: number) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/complete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, score, timeSpent: 0 })
      });

      const result = await response.json();

      setSimulationState(prev => ({
        ...prev,
        score: prev.score + score,
        completedTasks: [...prev.completedTasks, taskId],
        currentTask: result.nextTask
      }));

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-800 text-white flex flex-col relative">
      {/* Top Bar */}
      <div className="w-full bg-gray-900 p-4 flex justify-between items-center shadow-lg z-10">
        <h1 className="text-2xl font-bold">Medical Simulation</h1>
        <div className="flex items-center space-x-6">
          <div className="text-lg">
            Time: {new Date(simulationState.gameTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-lg">Score: {simulationState.score}</div>
          <div className="text-lg">
            Progress: {simulationState.completedTasks.length} / {caseData?.visits?.[0]?.tasks_for_visit?.length || 0} Tasks
          </div>
        </div>
        <button
          onClick={() => setSimulationState(prev => ({ ...prev, isShiftOver: true }))}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
        >
          End Shift
        </button>
      </div>

      <div className="flex-grow flex">
        {/* Game Area */}
        <div ref={gameAreaRef} className="flex-grow h-full bg-gray-700 relative overflow-hidden">
          {/* Player */}
          <motion.div
            className="w-10 h-10 bg-blue-500 rounded-full absolute shadow-lg border-2 border-blue-300"
            style={{ zIndex: 10 }}
            animate={{ x: simulationState.playerPosition.x, y: simulationState.playerPosition.y }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.05 }}
          />

          {/* Interactable Objects */}
          {interactableObjects.map(obj => (
            <div
              key={obj.id}
              className="absolute bg-green-600 rounded-md flex items-center justify-center font-bold text-sm p-2 shadow-xl"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                backgroundColor: obj.status === 'occupied' ? '#a56a6a' : '#4a9b6d',
                zIndex: 1
              }}
            >
              {obj.name}
            </div>
          ))}

          {/* NPCs */}
          {npcs.map(npc => (
            <div
              key={npc.id}
              className="absolute w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-semibold shadow-md"
              style={{ left: npc.x, top: npc.y, zIndex: 9 }}
            >
              {npc.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          ))}

          {/* Interaction Prompt */}
          {canInteract && !isModalOpen && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 px-6 py-3 rounded-lg shadow-2xl">
              <p className="text-lg">Press [E] to interact with {canInteract.name}</p>
            </div>
          )}
        </div>

        {/* Task List Sidebar */}
        <div className="w-80 bg-gray-900 p-6 overflow-y-auto shadow-inner">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-gray-700 pb-2">Task List</h2>
          <ul>
            {caseData?.visits?.[0]?.tasks_for_visit?.map((task: any, index: number) => (
              <motion.li
                key={task.id}
                className={`mb-4 p-4 rounded-lg ${
                  index === simulationState.completedTasks.length
                    ? 'bg-yellow-500 text-black'
                    : simulationState.completedTasks.includes(task.id)
                    ? 'bg-green-700 text-gray-400 line-through'
                    : 'bg-gray-800'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="font-bold">
                  {simulationState.completedTasks.includes(task.id) ? '✓' : ''} {task.description}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 relative"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              {getModalContent(canInteract!)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaseSimulation;
```

#### 3.2 Modal Components

```typescript
// components/modals/CheckInModal.tsx
interface CheckInModalProps {
  task: any;
  onComplete: (taskId: string, score: number) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ task, onComplete }) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handleCheckIn = () => {
    if (selectedPatient === task.expected_patient_id) {
      onComplete(task.id, 100);
    } else {
      onComplete(task.id, -50);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Patient Check-in</h3>
      <p className="mb-4">Select the correct patient for check-in:</p>

      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="patient"
            value="patient-smith"
            checked={selectedPatient === "patient-smith"}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="mr-2"
          />
          John Smith - 9:00 AM appointment
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="patient"
            value="patient-jones"
            checked={selectedPatient === "patient-jones"}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="mr-2"
          />
          Sarah Jones - 9:30 AM appointment
        </label>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={!selectedPatient}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500 w-full"
      >
        Check In Patient
      </button>
    </div>
  );
};

// components/modals/PatientInteractionModal.tsx
interface PatientInteractionModalProps {
  task: any;
  onComplete: (taskId: string, score: number) => void;
}

const PatientInteractionModal: React.FC<PatientInteractionModalProps> = ({ task, onComplete }) => {
  const handleDialogueChoice = (dialogue: any) => {
    onComplete(task.id, dialogue.score_impact);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Patient Interaction</h3>
      <p className="mb-4">Choose how to greet the patient:</p>

      <div className="space-y-2">
        {task.dialogue_options.map((dialogue: any, index: number) => (
          <button
            key={index}
            onClick={() => handleDialogueChoice(dialogue)}
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2 text-left"
          >
            {dialogue.text}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Phase 4: Mini-Game Integration

#### 4.1 EKG Mini-Game

```typescript
// components/mini-games/EKGGame.tsx
interface EKGGameProps {
  onComplete: (score: number) => void;
}

const EKGGame: React.FC<EKGGameProps> = ({ onComplete }) => {
  const [currentWaveform, setCurrentWaveform] = useState<any>(null);
  const [userInterpretation, setUserInterpretation] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(30);

  const waveforms = [
    { name: 'Normal Sinus Rhythm', image: '/ekg-normal.png', difficulty: 1 },
    { name: 'Sinus Tachycardia', image: '/ekg-tachycardia.png', difficulty: 2 },
    { name: 'Atrial Fibrillation', image: '/ekg-afib.png', difficulty: 3 },
    { name: 'Ventricular Tachycardia', image: '/ekg-vtach.png', difficulty: 4 }
  ];

  useEffect(() => {
    const randomWaveform = waveforms[Math.floor(Math.random() * waveforms.length)];
    setCurrentWaveform(randomWaveform);

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(0); // Time's up, no score
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    const correctAnswer = currentWaveform.name;
    const isCorrect = userInterpretation.toLowerCase() === correctAnswer.toLowerCase();

    let score = 0;
    if (isCorrect) {
      score = Math.max(50, 100 - (30 - timeRemaining) * 2); // Time bonus
    }

    onComplete(score);
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">EKG Interpretation</h2>
      <div className="text-center mb-4">
        <p className="text-lg">Time remaining: {timeRemaining}s</p>
      </div>

      {currentWaveform && (
        <div className="text-center mb-6">
          <img
            src={currentWaveform.image}
            alt="EKG Waveform"
            className="w-full max-w-md mx-auto border border-gray-300 rounded"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          What rhythm is this?
        </label>
        <input
          type="text"
          value={userInterpretation}
          onChange={(e) => setUserInterpretation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your interpretation..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit Answer
      </button>
    </div>
  );
};
```

#### 4.2 Vital Signs Recording

```typescript
// components/mini-games/VitalSignsGame.tsx
interface VitalSignsGameProps {
  expectedVitals: any;
  onComplete: (score: number) => void;
}

const VitalSignsGame: React.FC<VitalSignsGameProps> = ({ expectedVitals, onComplete }) => {
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: ''
  });

  const handleSubmit = () => {
    let score = 100;
    let accuracy = 0;

    // Check each vital sign for accuracy
    Object.keys(expectedVitals).forEach(key => {
      const expected = expectedVitals[key];
      const actual = vitals[key];

      if (key === 'bloodPressure') {
        // Blood pressure tolerance: ±10 mmHg
        const [expectedSystolic, expectedDiastolic] = expected.split('/').map(Number);
        const [actualSystolic, actualDiastolic] = actual.split('/').map(Number);

        if (Math.abs(actualSystolic - expectedSystolic) <= 10 &&
            Math.abs(actualDiastolic - expectedDiastolic) <= 10) {
          accuracy += 25;
        }
      } else if (key === 'heartRate') {
        // Heart rate tolerance: ±5 bpm
        if (Math.abs(Number(actual) - Number(expected)) <= 5) {
          accuracy += 25;
        }
      } else if (key === 'temperature') {
        // Temperature tolerance: ±0.5°F
        if (Math.abs(Number(actual) - Number(expected)) <= 0.5) {
          accuracy += 25;
        }
      } else if (key === 'respiratoryRate') {
        // Respiratory rate tolerance: ±2 breaths/min
        if (Math.abs(Number(actual) - Number(expected)) <= 2) {
          accuracy += 25;
        }
      }
    });

    score = Math.round((accuracy / 100) * 100);
    onComplete(score);
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg max-w-md">
      <h2 className="text-2xl font-bold mb-4">Record Vital Signs</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Blood Pressure (mmHg)</label>
          <input
            type="text"
            value={vitals.bloodPressure}
            onChange={(e) => setVitals(prev => ({ ...prev, bloodPressure: e.target.value }))}
            placeholder="e.g., 120/80"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
          <input
            type="number"
            value={vitals.heartRate}
            onChange={(e) => setVitals(prev => ({ ...prev, heartRate: e.target.value }))}
            placeholder="e.g., 72"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Temperature (°F)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.temperature}
            onChange={(e) => setVitals(prev => ({ ...prev, temperature: e.target.value }))}
            placeholder="e.g., 98.6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Respiratory Rate (breaths/min)</label>
          <input
            type="number"
            value={vitals.respiratoryRate}
            onChange={(e) => setVitals(prev => ({ ...prev, respiratoryRate: e.target.value }))}
            placeholder="e.g., 16"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Record Vitals
      </button>
    </div>
  );
};
```

## Implementation Timeline

### Week 1: Database Schema & Backend Foundation

- Update Prisma schema with enhanced MedicalCase and SimulationSession models
- Create database migration scripts
- Implement basic simulation service structure

### Week 2: Backend API Development

- Implement enhanced cases controller with simulation endpoints
- Create simulation service with session management
- Add task completion and scoring logic
- Implement progress tracking

### Week 3: Frontend Core Simulation Engine

- Create enhanced CaseSimulation component with 2D clinic layout
- Implement player movement system with WASD controls
- Add interaction detection and modal system
- Create basic task progression system

### Week 4: Interactive Features & Mini-Games

- Implement interactive objects and NPCs
- Create modal components for different task types
- Develop EKG mini-game
- Implement vital signs recording game

### Week 5: Integration & Testing

- Connect frontend to backend APIs
- Test simulation flow end-to-end
- Optimize performance and fix bugs
- Add error handling and edge cases

### Week 6: Polish & Documentation

- Add animations and visual feedback
- Implement save/load simulation state
- Create user documentation
- Performance optimization

## Success Metrics

1. **User Engagement**: Average session duration > 15 minutes
2. **Task Completion**: > 80% task completion rate
3. **Performance**: Smooth 60fps simulation experience
4. **Learning Outcomes**: Measurable improvement in user scores over time
5. **Technical**: < 200ms API response times, < 2s page load times

## Risk Mitigation

1. **Performance**: Implement efficient game loop and optimize rendering
2. **Complexity**: Start with basic simulation features and gradually add complexity
3. **Browser Compatibility**: Test across major browsers and implement fallbacks
4. **Data Management**: Implement proper state management and error handling
5. **User Experience**: Conduct user testing and iterate based on feedback

This implementation plan transforms the current static case simulation into an engaging, interactive medical training experience that matches the quality and engagement level of the reference ShadowClinic implementation.
