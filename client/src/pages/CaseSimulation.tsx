import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

interface InteractiveObject {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  status?: string;
  description?: string;
}

interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: string;
  role?: string;
  status?: string;
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

interface Task {
  id: string;
  description: string;
  type: string;
  score_impact: number;
  unlocks?: string[];
  dialogue_options?: Array<{
    text: string;
    score_impact: number;
    consequence: string;
    patient_response?: string;
    unlocks?: string[];
    expected_report_condition?: string;
    doctor_response_if_correct?: string;
    doctor_response_if_incorrect?: string;
    penalty_for_misreport?: number;
  }>;
  expected_patient_id?: string;
  patient_id?: string;
  room_id?: string;
  doctor_id?: string;
  location?: string;
  procedure_type?: string;
  expected_outcome?: string;
}

const CaseSimulation: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    playerPosition: { x: 50, y: 50 },
    score: 0,
    currentTask: null,
    completedTasks: [],
    patientState: "waiting",
    gameTime: new Date().setHours(9, 0, 0, 0),
    isShiftOver: false,
  });

  const [interactableObjects, setInteractableObjects] = useState<
    InteractiveObject[]
  >([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [canInteract, setCanInteract] = useState<
    InteractiveObject | NPC | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [caseData, setCaseData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Game loop using requestAnimationFrame
  const useAnimationFrame = (
    callback: (deltaTime: number) => void,
    isPaused: boolean
  ) => {
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

    setSimulationState((prev) => {
      let newX = prev.playerPosition.x;
      let newY = prev.playerPosition.y;

      if (keysPressed["w"]) newY -= moveDistance;
      if (keysPressed["s"]) newY += moveDistance;
      if (keysPressed["a"]) newX -= moveDistance;
      if (keysPressed["d"]) newX += moveDistance;

      // Boundary checking
      if (gameAreaRef.current) {
        const gameArea = gameAreaRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, gameArea.width - 40));
        newY = Math.max(0, Math.min(newY, gameArea.height - 40));
      }

      return {
        ...prev,
        playerPosition: { x: newX, y: newY },
      };
    });
  }, isModalOpen);

  // Load case data and initialize simulation
  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const response = await api.get(`/cases/${caseId}/simulation-data`);
        const data = response.data;

        setCaseData(data);
        setInteractableObjects(data.clinic_layout.interactable_objects);
        setNpcs(data.clinic_layout.npcs);

        // Set initial tasks
        if (data.visits && data.visits.length > 0) {
          const tasksData = data.visits[0].tasks_for_visit || [];
          // Ensure tasks have the required properties
          const normalizedTasks = tasksData.map((task: any) => ({
            id: task.id || `task-${Math.random()}`,
            description: task.description || "Complete task",
            type: task.type || "generic",
            score_impact: task.score_impact || 100,
            unlocks: task.unlocks || [],
            dialogue_options: task.dialogue_options || [],
            expected_patient_id: task.expected_patient_id,
            patient_id: task.patient_id,
            room_id: task.room_id,
            doctor_id: task.doctor_id,
            location: task.location,
            procedure_type: task.procedure_type,
            expected_outcome: task.expected_outcome,
          }));
          setTasks(normalizedTasks);
        } else {
          // Fallback tasks if no visits data
          setTasks([
            {
              id: "task-fallback",
              description: "Complete the simulation",
              type: "generic",
              score_impact: 100,
              unlocks: [],
              dialogue_options: [],
              location: undefined,
              procedure_type: undefined,
              expected_outcome: undefined,
            },
          ]);
        }

        // Start simulation session
        await api.post(`/cases/${caseId}/start-simulation`, {
          startTime: new Date().toISOString(),
          initialPosition: { x: 50, y: 50 },
        });
      } catch (error) {
        console.error("Failed to load simulation:", error);
      }
    };

    if (caseId) {
      loadSimulation();
    }
  }, [caseId]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isModalOpen) return;

      if (["w", "a", "s", "d"].includes(e.key.toLowerCase())) {
        setKeysPressed((keys) => ({ ...keys, [e.key.toLowerCase()]: true }));
      }

      if (e.key.toLowerCase() === "e" && canInteract && !isModalOpen) {
        handleInteraction(canInteract);
      }
    },
    [canInteract, isModalOpen]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (isModalOpen) return;
      setKeysPressed((keys) => ({ ...keys, [e.key.toLowerCase()]: false }));
    },
    [isModalOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Interaction detection
  useEffect(() => {
    const interaction = getInteraction();
    setCanInteract(interaction);

    // Debug logging
    if (interaction) {
      console.log(
        "Can interact with:",
        interaction.name,
        "Type:",
        interaction.type
      );
      console.log("Current task index:", currentTaskIndex);
      console.log("Current task:", tasks[currentTaskIndex]);
      console.log("Completed tasks:", simulationState.completedTasks);
    }

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
  }, [
    simulationState.playerPosition,
    interactableObjects,
    npcs,
    isModalOpen,
    canInteract,
    currentTaskIndex,
    tasks,
    simulationState.completedTasks,
  ]);

  const getInteraction = useCallback(() => {
    const playerCenterX = simulationState.playerPosition.x + 20;
    const playerCenterY = simulationState.playerPosition.y + 20;

    const allInteractables = [...interactableObjects, ...npcs];
    let closestInteraction = null;
    let closestDistance = Infinity;

    for (const object of allInteractables) {
      const objectCenterX = object.x + (object.width || 0) / 2;
      const objectCenterY = object.y + (object.height || 0) / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - objectCenterX, 2) +
          Math.pow(playerCenterY - objectCenterY, 2)
      );

      const objectRadius =
        Math.sqrt(
          Math.pow(object.width || 0, 2) + Math.pow(object.height || 0, 2)
        ) / 2;
      const interactionThreshold = objectRadius + 15;

      if (distance < interactionThreshold) {
        // Prioritize NPCs (patients, doctors) over objects (rooms, equipment)
        // NPCs get a higher priority by reducing their effective distance
        const priorityDistance =
          object.type === "patient" ||
          object.type === "doctor" ||
          object.type === "staff"
            ? distance * 0.7 // Give NPCs 30% priority boost
            : distance;

        if (priorityDistance < closestDistance) {
          closestDistance = priorityDistance;
          closestInteraction = object;
        }
      }
    }

    return closestInteraction;
  }, [simulationState.playerPosition, interactableObjects, npcs]);

  const handleInteraction = async (object: InteractiveObject | NPC) => {
    console.log(
      "Handling interaction with:",
      object.name,
      "Type:",
      object.type
    );
    console.log("Current task index:", currentTaskIndex);
    console.log("Current task:", tasks[currentTaskIndex]);

    const content = getModalContent(object);
    if (content) {
      setIsModalOpen(true);
    } else {
      console.log("No modal content available for this interaction");
    }
  };

  const getModalContent = (object: InteractiveObject | NPC) => {
    if (!caseData || !caseData.visits || tasks.length === 0) return null;

    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) {
      // Fallback modal content
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">Interaction</h3>
          <p className="mb-4">
            No specific task available for this interaction.
          </p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      );
    }

    // Check if this task is already completed
    if (simulationState.completedTasks.includes(currentTask.id)) {
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">Task Completed</h3>
          <p className="mb-4">This task has already been completed.</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Continue
          </button>
        </div>
      );
    }

    switch (object.type) {
      case "check_in":
        if (currentTask.type === "front_desk_check_in") {
          return (
            <CheckInModal task={currentTask} onComplete={handleTaskComplete} />
          );
        }
        break;

      case "patient":
      case "patient_interaction":
        if (currentTask.type === "patient_interaction") {
          return (
            <PatientInteractionModal
              task={currentTask}
              onComplete={handleTaskComplete}
            />
          );
        }
        break;

      case "computer":
        if (currentTask.type === "chart_vitals") {
          return (
            <ChartingModal task={currentTask} onComplete={handleTaskComplete} />
          );
        }
        if (currentTask.type === "history_physical") {
          return (
            <HistoryPhysicalModal
              task={currentTask}
              onComplete={handleTaskComplete}
            />
          );
        }
        break;

      case "equipment":
        if (currentTask.type === "procedure") {
          return (
            <ProcedureModal
              task={currentTask}
              onComplete={handleTaskComplete}
            />
          );
        }
        break;

      case "exam_room":
        if (currentTask.type === "room_patient") {
          return (
            <RoomPatientModal
              task={currentTask}
              onComplete={handleTaskComplete}
            />
          );
        }
        break;

      case "doctor":
        if (currentTask.type === "doctor_interaction") {
          return (
            <DoctorInteractionModal
              task={currentTask}
              onComplete={handleTaskComplete}
            />
          );
        }
        break;
    }

    // If no specific modal content, show a generic interaction
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Interaction</h3>
        <p className="mb-4">
          Interacting with {object.name} ({object.type})
        </p>
        <p className="mb-4 text-sm text-gray-300">
          Current task: {currentTask.description}
        </p>
        <button
          onClick={() => setIsModalOpen(false)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    );
  };

  const handleTaskComplete = async (taskId: string, score: number) => {
    try {
      const response = await api.post(`/cases/${caseId}/complete-task`, {
        taskId,
        score,
        timeSpent: 0,
        accuracy: 1.0,
      });

      const result = response.data;

      setSimulationState((prev) => ({
        ...prev,
        score: prev.score + score,
        completedTasks: [...prev.completedTasks, taskId],
        currentTask: result.nextTask,
      }));

      // Handle patient movement when rooming
      if (tasks[currentTaskIndex].type === "room_patient") {
        const patientId = tasks[currentTaskIndex].patient_id;
        const roomId = tasks[currentTaskIndex].room_id;

        if (patientId && roomId) {
          // Find the patient and room
          const patient = npcs.find((npc) => npc.id === patientId);
          const room = interactableObjects.find((obj) => obj.id === roomId);

          if (patient && room) {
            // Move patient to the center of the room
            setNpcs((prev) =>
              prev.map((npc) =>
                npc.id === patientId
                  ? {
                      ...npc,
                      x: room.x + room.width / 2 - 20, // Center in room
                      y: room.y + room.height / 2 - 20,
                      location: roomId, // Update patient location
                    }
                  : npc
              )
            );

            // Mark room as occupied
            setInteractableObjects((prev) =>
              prev.map((obj) =>
                obj.id === roomId ? { ...obj, status: "occupied" } : obj
              )
            );
          }
        }
      }

      // Move to next task
      const nextTaskIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextTaskIndex);
      setIsModalOpen(false);

      // Check if all tasks are completed
      if (nextTaskIndex >= tasks.length) {
        setSimulationState((prev) => ({ ...prev, isShiftOver: true }));
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  // Navigate to end shift when simulation is over
  useEffect(() => {
    if (simulationState.isShiftOver) {
      navigate("/end-shift", {
        state: {
          finalScore: simulationState.score,
          completed: simulationState.completedTasks.length,
          total: tasks.length,
        },
      });
    }
  }, [
    simulationState.isShiftOver,
    navigate,
    simulationState.score,
    simulationState.completedTasks.length,
    tasks.length,
  ]);

  return (
    <div className="w-full h-screen bg-gray-800 text-white flex flex-col relative">
      {/* Top Bar */}
      <div className="w-full bg-gray-900 p-4 flex justify-between items-center shadow-lg z-10">
        <h1 className="text-2xl font-bold">Medical Simulation</h1>
        <div className="flex items-center space-x-6">
          <div className="text-lg">
            Time:{" "}
            {new Date(simulationState.gameTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-lg">Score: {simulationState.score}</div>
          <div className="text-lg">
            Progress: {simulationState.completedTasks.length} / {tasks.length}{" "}
            Tasks
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Debug Info */}
          <div className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded">
            Task: {currentTaskIndex + 1}/{tasks.length}
          </div>
          <div className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded">
            {canInteract ? `Near: ${canInteract.name}` : "No interaction"}
          </div>
          <button
            onClick={() =>
              setSimulationState((prev) => ({ ...prev, isShiftOver: true }))
            }
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            End Shift
          </button>
        </div>
      </div>

      <div className="flex-grow flex">
        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="flex-grow h-full bg-gray-700 relative overflow-hidden min-h-0"
          style={{ minHeight: "400px" }}
        >
          {/* Player */}
          <motion.div
            className="w-10 h-10 bg-blue-500 rounded-full absolute shadow-lg border-2 border-blue-300"
            style={{ zIndex: 10 }}
            animate={{
              x: simulationState.playerPosition.x,
              y: simulationState.playerPosition.y,
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.05 }}
          />

          {/* Interactable Objects */}
          {interactableObjects.map((obj) => (
            <div
              key={obj.id}
              className={`absolute rounded-md flex items-center justify-center font-bold text-sm p-2 shadow-xl transition-all duration-200 ${
                canInteract?.id === obj.id
                  ? "ring-4 ring-yellow-400 ring-opacity-75"
                  : ""
              }`}
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                backgroundColor:
                  obj.status === "occupied" ? "#a56a6a" : "#4a9b6d",
                zIndex: 1,
              }}
            >
              {obj.name}
            </div>
          ))}

          {/* NPCs */}
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shadow-md transition-all duration-200 ${
                canInteract?.id === npc.id
                  ? "ring-4 ring-yellow-400 ring-opacity-75 scale-110"
                  : ""
              }`}
              style={{
                left: npc.x,
                top: npc.y,
                zIndex: 9,
                backgroundColor: npc.type === "patient" ? "#ff6b6b" : "#ffd93d",
              }}
            >
              {npc.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
          ))}

          {/* Interaction Prompt */}
          {canInteract && !isModalOpen && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 px-6 py-3 rounded-lg shadow-2xl border border-yellow-400">
              <p className="text-lg font-semibold text-yellow-400">
                Press [E] to interact with {canInteract.name}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Type: {canInteract.type} | Current Task:{" "}
                {tasks[currentTaskIndex]?.description || "None"}
              </p>
            </div>
          )}
        </div>

        {/* Task List Sidebar */}
        <div className="w-80 bg-gray-900 p-6 overflow-y-auto shadow-inner flex-shrink-0">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-gray-700 pb-2">
            Task List
          </h2>
          <ul>
            {tasks.map((task, index) => (
              <motion.li
                key={task.id}
                className={`mb-4 p-4 rounded-lg ${
                  index === currentTaskIndex
                    ? "bg-yellow-500 text-black"
                    : simulationState.completedTasks.includes(task.id)
                      ? "bg-green-700 text-gray-400 line-through"
                      : "bg-gray-800"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="font-bold">
                  {simulationState.completedTasks.includes(task.id) ? "✓" : ""}{" "}
                  {task.description}
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

// Modal Components
interface ModalProps {
  task: Task;
  onComplete: (taskId: string, score: number) => void;
}

const CheckInModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handleCheckIn = () => {
    if (selectedPatient === "patient-smith") {
      onComplete(task.id, task.score_impact);
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

const PatientInteractionModal: React.FC<ModalProps> = ({
  task,
  onComplete,
}) => {
  const [selectedDialogue, setSelectedDialogue] = useState<any>(null);

  const handleDialogueChoice = (dialogue: any) => {
    setSelectedDialogue(dialogue);
    onComplete(task.id, dialogue.score_impact);
  };

  // If no dialogue options, provide a simple completion
  if (!task.dialogue_options || task.dialogue_options.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Patient Interaction</h3>
        <p className="mb-4">Complete the patient interaction task.</p>

        <button
          onClick={() => onComplete(task.id, task.score_impact)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Complete Interaction
        </button>
      </div>
    );
  }

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

const ChartingModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const handleComplete = () => {
    onComplete(task.id, task.score_impact);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Chart Vitals</h3>
      <p className="mb-4">Record the patient's vital signs in the system.</p>

      <button
        onClick={handleComplete}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
      >
        Complete Charting
      </button>
    </div>
  );
};

const HistoryPhysicalModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const handleComplete = () => {
    onComplete(task.id, task.score_impact);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">History and Physical</h3>
      <p className="mb-4">Complete the history and physical assessment.</p>

      <button
        onClick={handleComplete}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
      >
        Complete Assessment
      </button>
    </div>
  );
};

const RoomPatientModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const handleComplete = () => {
    onComplete(task.id, task.score_impact);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Room Patient</h3>
      <p className="mb-4">Escort the patient to an available exam room.</p>

      <button
        onClick={handleComplete}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
      >
        Patient Roomed
      </button>
    </div>
  );
};

const DoctorInteractionModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const [selectedDialogue, setSelectedDialogue] = useState<any>(null);

  const handleDialogueChoice = (dialogue: any) => {
    setSelectedDialogue(dialogue);
    onComplete(task.id, dialogue.score_impact);
  };

  // If no dialogue options, provide a simple completion
  if (!task.dialogue_options || task.dialogue_options.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Doctor Interaction</h3>
        <p className="mb-4">Complete the doctor interaction task.</p>

        <button
          onClick={() => onComplete(task.id, task.score_impact)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Complete Interaction
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Doctor Interaction</h3>
      <p className="mb-4">Report the patient's vitals to Dr. Adams:</p>

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

const ProcedureModal: React.FC<ModalProps> = ({ task, onComplete }) => {
  const [procedureStep, setProcedureStep] = useState(1);

  const handleProcedureStep = () => {
    if (procedureStep < 3) {
      setProcedureStep(procedureStep + 1);
    } else {
      // Complete the procedure
      onComplete(task.id, task.score_impact);
    }
  };

  const getProcedureContent = () => {
    switch (procedureStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Procedure Setup</h3>
            <p className="mb-4">
              Preparing the {task.procedure_type} equipment...
            </p>
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-sm">• Check equipment calibration</p>
              <p className="text-sm">• Prepare necessary supplies</p>
              <p className="text-sm">• Ensure patient is ready</p>
            </div>
            <button
              onClick={handleProcedureStep}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next Step
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Performing Procedure</h3>
            <p className="mb-4">
              Executing the {task.procedure_type} procedure...
            </p>
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-sm">• Following proper protocol</p>
              <p className="text-sm">• Monitoring patient response</p>
              <p className="text-sm">• Recording procedure data</p>
            </div>
            <button
              onClick={handleProcedureStep}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next Step
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Procedure Complete</h3>
            <p className="mb-4">
              The {task.procedure_type} procedure has been completed
              successfully.
            </p>
            <div className="mb-4 p-3 bg-green-700 rounded">
              <p className="text-sm">• Procedure completed</p>
              <p className="text-sm">• Results recorded</p>
              <p className="text-sm">• Patient status updated</p>
            </div>
            <button
              onClick={handleProcedureStep}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Complete Procedure
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div>{getProcedureContent()}</div>;
};

export default CaseSimulation;
