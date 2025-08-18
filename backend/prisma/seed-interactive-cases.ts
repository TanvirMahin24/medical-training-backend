import { PrismaClient, CaseDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const seedInteractiveCases = async () => {
  try {
    console.log('Starting to seed interactive cases...');

    // Clear existing cases first
    await prisma.medicalCase.deleteMany({});

    const interactiveCaseData = {
      title: 'John Smith - Hypertension Management',
      description:
        'A multi-visit case focusing on managing hypertension with interactive clinic environment',
      difficulty: 'BEGINNER' as CaseDifficulty,
      category: 'Cardiology',
      tags: ['hypertension', 'primary-care', 'follow-up'],
      estimatedDuration: 30,
      content: {
        clinic_layout: {
          interactable_objects: [
            {
              id: 'front-desk',
              name: 'Front Desk',
              type: 'check_in',
              x: 100,
              y: 100,
              width: 120,
              height: 60,
              status: 'available',
              description: 'Patient check-in area',
            },
            {
              id: 'waiting-room',
              name: 'Waiting Room',
              type: 'waiting_area',
              x: 300,
              y: 100,
              width: 200,
              height: 150,
              status: 'available',
              description: 'Patient waiting area',
            },
            {
              id: 'exam-room-1',
              name: 'Exam Room 1',
              type: 'exam_room',
              x: 100,
              y: 300,
              width: 120,
              height: 100,
              status: 'available',
              description: 'Examination room',
            },
            {
              id: 'exam-room-2',
              name: 'Exam Room 2',
              type: 'exam_room',
              x: 250,
              y: 300,
              width: 120,
              height: 100,
              status: 'occupied',
              description: 'Examination room',
            },
            {
              id: 'computer-station',
              name: 'Computer Station',
              type: 'computer',
              x: 400,
              y: 100,
              width: 80,
              height: 60,
              status: 'available',
              description: 'Charting and vital signs entry',
            },
            {
              id: 'ekg-machine',
              name: 'EKG Machine',
              type: 'equipment',
              x: 500,
              y: 300,
              width: 100,
              height: 80,
              status: 'available',
              description: 'Electrocardiogram machine',
            },
          ],
          npcs: [
            {
              id: 'npc-receptionist',
              name: 'Sarah Johnson',
              type: 'staff',
              x: 120,
              y: 120,
              role: 'Receptionist',
              status: 'available',
            },
            {
              id: 'npc-doctor-adams',
              name: 'Dr. Michael Adams',
              type: 'doctor',
              x: 450,
              y: 120,
              role: 'Primary Care Physician',
              status: 'available',
            },
            {
              id: 'npc-patient-smith',
              name: 'John Smith',
              type: 'patient',
              x: 350,
              y: 150,
              role: 'Patient',
              status: 'waiting',
            },
          ],
        },
        patient_info: {
          id: 'patient-smith',
          name: 'John Smith',
          age: 45,
          gender: 'Male',
          chief_complaint: 'Hypertension follow-up',
          medical_history:
            'Diagnosed with hypertension 2 years ago, currently on Lisinopril.',
          current_medications: ['Lisinopril 10mg daily'],
          allergies: ['None'],
          vitals: {},
        },
        visits: [
          {
            visit_number: 1,
            date: '2025-01-15',
            main_complaint: 'Routine check-up for hypertension',
            expected_vitals: {
              bloodPressure: '120/80',
              heartRate: '72',
              temperature: '98.6',
              respiratoryRate: '16',
            },
            medical_history: {
              main_complaint: 'Routine check-up',
              allergies: ['None'],
              medications: ['Lisinopril 10mg daily'],
            },
            expected_medical_assessment: {
              overall_condition: 'controlled',
              reason:
                'Vitals within target range, patient reports adherence to medication.',
            },
            tasks_for_visit: [
              {
                id: 'task-check-in',
                description: 'Check in John Smith at the front desk.',
                type: 'front_desk_check_in',
                expected_patient_id: 'patient-smith',
                dialogue_options: [],
                score_impact: 50,
                unlocks: ['task-greet'],
              },
              {
                id: 'task-greet',
                description:
                  'Greet John Smith and escort him to an empty exam room.',
                type: 'patient_interaction',
                patient_id: 'patient-smith',
                location: 'waiting-room',
                dialogue_options: [
                  {
                    text: "Hello, Mr. Smith? My name is Alex, and I'll be your Medical Assistant today. Please follow me.",
                    score_impact: 50,
                    consequence: 'patient_follows',
                    patient_response: 'Thank you, Alex. Nice to meet you.',
                  },
                  {
                    text: "You're next. Come on back.",
                    score_impact: -50,
                    consequence: 'patient_rude_but_follows',
                    patient_response: "That's a bit rude, but okay.",
                  },
                  {
                    text: 'Are you John?',
                    score_impact: 20,
                    consequence: 'patient_follows',
                    patient_response: "Yes, that's me.",
                  },
                ],
                score_impact: 100,
                unlocks: ['task-room'],
              },
              {
                id: 'task-room',
                description: 'Room John Smith in an empty exam room.',
                type: 'room_patient',
                patient_id: 'patient-smith',
                room_id: 'exam-room-1',
                score_impact: 75,
                unlocks: ['task-history-physical'],
              },
              {
                id: 'task-history-physical',
                description:
                  "Get John Smith's medical history and perform a physical assessment.",
                type: 'history_physical',
                patient_id: 'patient-smith',
                score_impact: 150,
                unlocks: ['task-record'],
              },
              {
                id: 'task-record',
                description: "Record John Smith's vitals in the system.",
                type: 'chart_vitals',
                patient_id: 'patient-smith',
                score_impact: 100,
                unlocks: ['task-report-doctor'],
              },
              {
                id: 'task-report-doctor',
                description: 'Report vitals to Dr. Adams.',
                type: 'doctor_interaction',
                doctor_id: 'npc-doctor-adams',
                dialogue_options: [
                  {
                    text: "Dr. Adams, Mr. Smith's vitals are all within normal limits.",
                    score_impact: 50,
                    consequence: 'doctor_acknowledges',
                    expected_report_condition: 'controlled',
                    doctor_response_if_correct:
                      'Excellent, thank you. Keep up the good work, Mr. Smith.',
                    doctor_response_if_incorrect:
                      "Actually, that's not quite right. Let's review his chart together.",
                    penalty_for_misreport: -50,
                  },
                  {
                    text: "Dr. Adams, Mr. Smith's blood pressure is a bit high.",
                    score_impact: -20,
                    consequence: 'doctor_corrects',
                    expected_report_condition: 'abnormal',
                    doctor_response_if_correct:
                      'Okay, what are the numbers? We might need to adjust his medication.',
                    doctor_response_if_incorrect:
                      'No, his vitals are actually well within the controlled range. Please double-check your readings.',
                    penalty_for_misreport: -50,
                  },
                ],
                score_impact: 125,
                unlocks: [],
              },
            ],
          },
          {
            visit_number: 2,
            date: '2025-04-15',
            main_complaint: 'Follow-up for hypertension, mild headache',
            expected_vitals: {
              bloodPressure: '145/95',
              heartRate: '80',
              temperature: '98.6',
              respiratoryRate: '18',
            },
            medical_history: {
              main_complaint: 'Follow-up for hypertension, mild headache',
              allergies: ['None'],
              medications: ['Lisinopril 10mg daily'],
            },
            expected_medical_assessment: {
              overall_condition: 'worsening',
              reason: 'Elevated blood pressure and new headache symptom.',
            },
            tasks_for_visit: [
              {
                id: 'task-check-in-2',
                description: 'Check in John Smith at the front desk.',
                type: 'front_desk_check_in',
                expected_patient_id: 'patient-smith',
                dialogue_options: [],
                score_impact: 50,
                unlocks: ['task-greet-2'],
              },
              {
                id: 'task-greet-2',
                description:
                  'Greet John Smith and escort him to an empty exam room.',
                type: 'patient_interaction',
                patient_id: 'patient-smith',
                location: 'waiting-room',
                dialogue_options: [
                  {
                    text: "Hello, Mr. Smith? My name is Alex, and I'll be your Medical Assistant today. Please follow me.",
                    score_impact: 50,
                    consequence: 'patient_follows',
                    patient_response: 'Thank you, Alex. Nice to see you again.',
                  },
                ],
                score_impact: 100,
                unlocks: ['task-room-2'],
              },
              {
                id: 'task-room-2',
                description: 'Room John Smith in an empty exam room.',
                type: 'room_patient',
                patient_id: 'patient-smith',
                room_id: 'exam-room-1',
                score_impact: 75,
                unlocks: ['task-history-physical-2'],
              },
              {
                id: 'task-history-physical-2',
                description:
                  "Get John Smith's medical history and perform a physical assessment.",
                type: 'history_physical',
                patient_id: 'patient-smith',
                score_impact: 150,
                unlocks: ['task-record-2'],
              },
              {
                id: 'task-record-2',
                description: "Record John Smith's vitals in the system.",
                type: 'chart_vitals',
                patient_id: 'patient-smith',
                score_impact: 100,
                unlocks: ['task-report-doctor-2'],
              },
              {
                id: 'task-report-doctor-2',
                description: 'Report vitals to Dr. Adams.',
                type: 'doctor_interaction',
                doctor_id: 'npc-doctor-adams',
                dialogue_options: [
                  {
                    text: "Dr. Adams, Mr. Smith's vitals are all within normal limits.",
                    score_impact: -50,
                    consequence: 'doctor_corrects',
                    expected_report_condition: 'controlled',
                    doctor_response_if_correct:
                      'Excellent, thank you. Keep up the good work, Mr. Smith.',
                    doctor_response_if_incorrect:
                      "Actually, that's not quite right. Let's review his chart together.",
                    penalty_for_misreport: -50,
                  },
                  {
                    text: "Dr. Adams, Mr. Smith's blood pressure is a bit high.",
                    score_impact: 50,
                    consequence: 'doctor_acknowledges',
                    expected_report_condition: 'worsening',
                    doctor_response_if_correct:
                      'Okay, what are the numbers? We might need to adjust his medication.',
                    doctor_response_if_incorrect:
                      'No, his vitals are actually well within the controlled range. Please double-check your readings.',
                    penalty_for_misreport: -50,
                  },
                ],
                score_impact: 125,
                unlocks: ['task-ekg'],
              },
              {
                id: 'task-ekg',
                description: 'Perform a stat EKG on John Smith.',
                type: 'procedure',
                procedure_type: 'ekg',
                patient_id: 'patient-smith',
                expected_outcome: 'sinus_tachycardia',
                score_impact: 200,
                unlocks: [],
              },
            ],
          },
        ],
        patient_arrivals: [
          {
            patient_id: 'patient-smith',
            arrival_time: '09:00',
            visit_number: 1,
          },
          {
            patient_id: 'patient-smith',
            arrival_time: '10:00',
            visit_number: 2,
          },
        ],
      },
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      createdBy: null,
    };

    const createdCase = await prisma.medicalCase.upsert({
      where: { id: 'john-smith-hypertension-case' },
      update: interactiveCaseData,
      create: {
        id: 'john-smith-hypertension-case',
        ...interactiveCaseData,
      },
    });

    console.log('Interactive case seeded successfully:', createdCase.title);

    // Create a second case for variety
    const diabetesCaseData = {
      title: 'Maria Rodriguez - Diabetes Management',
      description:
        'A diabetes management case with blood glucose monitoring and lifestyle counseling',
      difficulty: 'INTERMEDIATE' as CaseDifficulty,
      category: 'Endocrinology',
      tags: ['diabetes', 'blood-glucose', 'lifestyle'],
      estimatedDuration: 25,
      content: {
        clinic_layout: {
          interactable_objects: [
            {
              id: 'front-desk-2',
              name: 'Front Desk',
              type: 'check_in',
              x: 100,
              y: 100,
              width: 120,
              height: 60,
              status: 'available',
              description: 'Patient check-in area',
            },
            {
              id: 'waiting-room-2',
              name: 'Waiting Room',
              type: 'waiting_area',
              x: 300,
              y: 100,
              width: 200,
              height: 150,
              status: 'available',
              description: 'Patient waiting area',
            },
            {
              id: 'exam-room-3',
              name: 'Exam Room 3',
              type: 'exam_room',
              x: 100,
              y: 300,
              width: 120,
              height: 100,
              status: 'available',
              description: 'Examination room',
            },
            {
              id: 'glucose-monitor',
              name: 'Glucose Monitor',
              type: 'equipment',
              x: 400,
              y: 200,
              width: 80,
              height: 60,
              status: 'available',
              description: 'Blood glucose monitoring device',
            },
          ],
          npcs: [
            {
              id: 'npc-receptionist-2',
              name: 'Sarah Johnson',
              type: 'staff',
              x: 120,
              y: 120,
              role: 'Receptionist',
              status: 'available',
            },
            {
              id: 'npc-doctor-chen',
              name: 'Dr. Lisa Chen',
              type: 'doctor',
              x: 450,
              y: 120,
              role: 'Endocrinologist',
              status: 'available',
            },
            {
              id: 'npc-patient-rodriguez',
              name: 'Maria Rodriguez',
              type: 'patient',
              x: 350,
              y: 150,
              role: 'Patient',
              status: 'waiting',
            },
          ],
        },
        patient_info: {
          id: 'patient-rodriguez',
          name: 'Maria Rodriguez',
          age: 58,
          gender: 'Female',
          chief_complaint: 'Diabetes follow-up and blood glucose monitoring',
          medical_history:
            'Type 2 diabetes diagnosed 5 years ago, on Metformin.',
          current_medications: ['Metformin 500mg twice daily'],
          allergies: ['Sulfa drugs'],
          vitals: {},
        },
        visits: [
          {
            visit_number: 1,
            date: '2025-01-20',
            main_complaint: 'Routine diabetes follow-up',
            expected_vitals: {
              bloodPressure: '135/85',
              heartRate: '78',
              temperature: '98.4',
              respiratoryRate: '16',
            },
            medical_history: {
              main_complaint: 'Routine diabetes follow-up',
              allergies: ['Sulfa drugs'],
              medications: ['Metformin 500mg twice daily'],
            },
            expected_medical_assessment: {
              overall_condition: 'stable',
              reason:
                'Blood glucose levels within target range, patient reports good medication adherence.',
            },
            tasks_for_visit: [
              {
                id: 'task-check-in-rodriguez',
                description: 'Check in Maria Rodriguez at the front desk.',
                type: 'front_desk_check_in',
                expected_patient_id: 'patient-rodriguez',
                dialogue_options: [],
                score_impact: 50,
                unlocks: ['task-greet-rodriguez'],
              },
              {
                id: 'task-greet-rodriguez',
                description:
                  'Greet Maria Rodriguez and escort her to an exam room.',
                type: 'patient_interaction',
                patient_id: 'patient-rodriguez',
                location: 'waiting-room-2',
                dialogue_options: [
                  {
                    text: "Hello, Ms. Rodriguez? I'm Alex, your Medical Assistant today. Please follow me.",
                    score_impact: 50,
                    consequence: 'patient_follows',
                    patient_response: 'Thank you, Alex. Nice to meet you.',
                  },
                ],
                score_impact: 100,
                unlocks: ['task-room-rodriguez'],
              },
              {
                id: 'task-room-rodriguez',
                description: 'Room Maria Rodriguez in an exam room.',
                type: 'room_patient',
                patient_id: 'patient-rodriguez',
                room_id: 'exam-room-3',
                score_impact: 75,
                unlocks: ['task-glucose-test'],
              },
              {
                id: 'task-glucose-test',
                description: 'Perform blood glucose test on Maria Rodriguez.',
                type: 'procedure',
                procedure_type: 'glucose_test',
                patient_id: 'patient-rodriguez',
                expected_outcome: 'normal_range',
                score_impact: 150,
                unlocks: ['task-report-doctor-rodriguez'],
              },
              {
                id: 'task-report-doctor-rodriguez',
                description: 'Report glucose results to Dr. Chen.',
                type: 'doctor_interaction',
                doctor_id: 'npc-doctor-chen',
                dialogue_options: [
                  {
                    text: "Dr. Chen, Ms. Rodriguez's blood glucose is 125 mg/dL, which is within normal range.",
                    score_impact: 50,
                    consequence: 'doctor_acknowledges',
                    expected_report_condition: 'normal',
                    doctor_response_if_correct:
                      "Good, that's well controlled. Keep monitoring as scheduled.",
                    doctor_response_if_incorrect:
                      'Let me check those numbers again.',
                    penalty_for_misreport: -50,
                  },
                ],
                score_impact: 125,
                unlocks: [],
              },
            ],
          },
        ],
        patient_arrivals: [
          {
            patient_id: 'patient-rodriguez',
            arrival_time: '14:00',
            visit_number: 1,
          },
        ],
      },
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
      createdBy: null,
    };

    const createdDiabetesCase = await prisma.medicalCase.upsert({
      where: { id: 'maria-rodriguez-diabetes-case' },
      update: diabetesCaseData,
      create: {
        id: 'maria-rodriguez-diabetes-case',
        ...diabetesCaseData,
      },
    });

    console.log(
      'Diabetes case seeded successfully:',
      createdDiabetesCase.title,
    );

    console.log('All interactive cases seeded successfully!');
  } catch (error) {
    console.error('Error seeding interactive cases:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

seedInteractiveCases()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
