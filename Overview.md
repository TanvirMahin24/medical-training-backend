# ShadowClinic Project Plan

## 1. Project Overview

ShadowClinic is a web-based educational simulation platform designed for Medical Assistants (MAs), with a long-term vision of expanding to other healthcare roles like nurses and doctors. The platform aims to provide realistic, gamified clinical case scenarios to train and assess MAs in a safe and controlled environment. The core of the project is to simulate a day in a clinic, where the user interacts with patients, performs tasks, and makes decisions that have consequences on their score and the patient's outcome.

The project is currently in a stable, working state, with the core simulation logic implemented. The next phase of development will focus on building out the remaining mini-games, polishing the user interface, and ensuring the application is robust through comprehensive testing.

## 2. Tech Stack

| Category | Technology    |
| -------- | ------------- |
| Frontend | React         |
|          | Tailwind CSS  |
|          | Framer Motion |
| Backend  | Node.js       |
|          | Express       |
| Database | PostgreSQL    |

## 3. Getting Started

To get the project running locally, you will need to have Node.js and PostgreSQL installed.

### Backend Setup

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file and configure the database connection and `JWT_SECRET`.
4.  Run database migrations: `npm run migrate`
5.  Seed the database: `npm run seed`
6.  Start the backend server: `npm start`

### Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Start the frontend development server: `npm start`

## 4. Application Architecture

The application is divided into a frontend and a backend.

### Backend

The backend is a Node.js application using the Express framework. It is responsible for:

- **Authentication:** User registration and login.
- **Case Management:** Serving the clinical case scenarios to the frontend.
- **Session Management:** Tracking user progress through the simulations.
- **Leaderboard:** Calculating and providing leaderboard data.
- **Database:** Interacting with the PostgreSQL database.

### Frontend

The frontend is a React application responsible for:

- **User Interface:** Rendering the simulation environment, dashboard, and other pages.
- **State Management:** Using a combination of React hooks and a Zustand store (`useSimulationStore.js`) to manage the application state.
- **API Interaction:** Communicating with the backend to fetch data and save user progress.

## 5. Scenario JSON Structure

The clinical scenarios are defined in a JSON object. This object is stored in the `backend/db/seeds/seed_cases.js` file. The structure of this object is crucial for the simulation's logic. The `tasks_for_visit` array contains a list of tasks, each with a `type` that determines the interaction.

**Existing `task` types include:**

- `front_desk_check_in`: Checking a patient in.
- `patient_interaction`: Dialogue-based interactions.
- `room_patient`: Moving a patient to an exam room.
- `history_physical`: Gathering patient history.
- `chart_vitals`: Recording vitals in the system.
- `doctor_interaction`: Reporting to a doctor.
- `procedure`: A placeholder for mini-games.

Here is an example of the `johnSmithCase` object:

```json
{
  "case_id": "uuidv4()",
  "case_name": "John Smith - Hypertension Management",
  "description": "A series of visits for John Smith, focusing on managing his hypertension and observing trends.",
  "patient_info": {
    "id": "patient-smith",
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "chief_complaint": "Hypertension follow-up"
  },
  "visits": [
    {
      "visit_number": 1,
      "tasks_for_visit": [
        {
          "id": "task-greet",
          "description": "Greet John Smith and escort him to an empty exam room.",
          "type": "patient_interaction",
          "patient_id": "patient-smith",
          "dialogue_options": [
            {
              "text": "Hello, Mr. Smith? My name is Alex, and I'll be your Medical Assistant today. Please follow me.",
              "score_impact": 50,
              "consequence": "patient_follows"
            },
            {
              "text": "You're next. Come on back.",
              "score_impact": -50,
              "consequence": "patient_rude_but_follows",
              "patient_response": "That's a bit rude, but okay."
            }
          ]
        }
      ]
    }
  ]
}
```

**Important:** After any changes to `backend/db/seeds/seed_cases.js`, you _must_ re-seed your database to ensure the frontend receives the updated case data structure.

## 6. Progress & Completed Tasks

- **Backend:** The backend is complete. All necessary endpoints for authentication, case management, and session tracking are implemented.
- **Frontend:**
  - The core simulation UI (`Shift.jsx`) is implemented, including the dynamic patient encounter scenario.
  - The dashboard (`Dashboard.jsx`) is connected to the backend and displays user statistics.
  - State management is implemented using Zustand.
  - Major bugs related to data fetching, UI rendering, and state management have been fixed.

## 7. Future Tasks & Roadmap

### Mini-Game Development

The following mini-games need to be developed and integrated into the simulation. Each should be an interactive and realistic representation of the clinical procedure. The `type` property in the task object should be expanded to support these new procedures.

- **Blood Pressure Mini-Game:** An interactive mini-game for taking a patient's blood pressure. (Type: `procedure_bp`)
- **EKG Mini-Game:** An interactive mini-game for performing an EKG. A placeholder is currently implemented. (Type: `procedure_ekg`)
- **Venipuncture (Blood Draw):** A mini-game simulating the process of drawing blood. (Type: `procedure_blood_draw`)
- **Urine Dipstick Test:** A mini-game for analyzing a urine sample. (Type: `procedure_urine_test`)
- **Wound Care:** A mini-game for cleaning and dressing a minor wound. (Type: `procedure_wound_care`)
- **Administering Injections:** A mini-game for giving intramuscular or subcutaneous injections. (Type: `procedure_injection`)
- **Vision Test:** An interactive Snellen chart test. (Type: `procedure_vision_test`)

### Scenario & Content Expansion

To enhance the training value, the variety and complexity of scenarios should be expanded.

- **Diverse Medical Conditions:** Develop cases for common conditions like diabetes management, respiratory infections, and minor injuries.
- **Multi-Visit Scenarios:** Create scenarios where a patient's condition evolves over multiple visits based on the user's actions in previous encounters.
- **Difficult Patient Archetypes:** Introduce patients with challenging behaviors (e.g., anxious, angry, non-communicative) to test the user's soft skills.

### UI/UX Polishing

The overall UI/UX of the application needs to be polished. This includes:

- **Styling:** Improving the styling of all components to create a more visually appealing and professional look.
- **Animations:** Adding animations to enhance the user experience. A 2D animation style is preferred.
- **Responsiveness:** Ensuring the application is fully responsive and works well on different screen sizes.

### Testing

- **Unit Tests:** Write unit tests for both the backend and frontend to ensure the correctness of individual components.
- **Integration Tests:** Write integration tests to ensure the frontend and backend work together correctly.

## 8. Advanced Features (Long-Term Vision)

These features can be considered after the core MA simulation is complete and robust.

- **Dynamic Patient Emotional State:** The patient's mood and dialogue could change dynamically based on the MA's actions (e.g., being reassuring vs. being dismissive).
- **Branching Narratives:** Key decisions could lead to fundamentally different scenario paths and outcomes, increasing replayability and the impact of choices.
- **Instructor Dashboard:** A portal for educators to create, assign, and review student scenarios, view detailed performance analytics, and provide feedback.

## 9. Animation & Styling

The desired animation style for the simulation is 2D. This could involve using sprites for the characters and simple animations for movement and interactions. The goal is to create an engaging and visually clear experience for the user.

The overall styling should be clean, modern, and professional, befitting a medical training application.
