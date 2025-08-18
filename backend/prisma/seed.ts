import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicaltraining.com' },
    update: {},
    create: {
      email: 'admin@medicaltraining.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      subscriptionStatus: 'ACTIVE',
      profile: {
        create: {
          phone: '+1234567890',
          specialization: 'System Administrator',
          experienceYears: 5,
        },
      },
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'First Case' },
      update: {},
      create: {
        name: 'First Case',
        description: 'Complete your first medical case',
        imageUrl: '/badges/first-case.png',
        criteria: { type: 'first_case_completion' },
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Perfect Score' },
      update: {},
      create: {
        name: 'Perfect Score',
        description: 'Achieve a perfect score on any case',
        imageUrl: '/badges/perfect-score.png',
        criteria: { type: 'perfect_score', score: 100 },
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Case Master' },
      update: {},
      create: {
        name: 'Case Master',
        description: 'Complete 10 medical cases',
        imageUrl: '/badges/case-master.png',
        criteria: { type: 'case_completion_count', count: 10 },
      },
    }),
  ]);

  console.log('✅ Sample badges created:', badges.length);

  // Create sample medical cases
  const cases = await Promise.all([
    prisma.medicalCase.upsert({
      where: { title: 'Hypertension Management - John Smith' },
      update: {},
      create: {
        title: 'Hypertension Management - John Smith',
        description:
          'A series of visits for John Smith, focusing on managing his hypertension and observing trends.',
        difficulty: 'BEGINNER',
        category: 'Cardiology',
        tags: ['hypertension', 'follow-up', 'vitals'],
        estimatedDuration: 15,
        content: {
          patient: {
            id: 'patient-smith',
            name: 'John Smith',
            age: 45,
            gender: 'Male',
            chiefComplaint: 'Hypertension follow-up',
          },
          visits: [
            {
              visitNumber: 1,
              tasks: [
                {
                  id: 'task-greet',
                  description:
                    'Greet John Smith and escort him to an empty exam room.',
                  type: 'patient_interaction',
                  options: [
                    {
                      text: "Hello, Mr. Smith? My name is Alex, and I'll be your Medical Assistant today. Please follow me.",
                      score: 50,
                      consequence: 'patient_follows',
                    },
                    {
                      text: "You're next. Come on back.",
                      score: -50,
                      consequence: 'patient_rude_but_follows',
                      patientResponse: "That's a bit rude, but okay.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: admin.id,
      },
    }),
    prisma.medicalCase.upsert({
      where: { title: 'Diabetes Management - Sarah Johnson' },
      update: {},
      create: {
        title: 'Diabetes Management - Sarah Johnson',
        description:
          'Help Sarah Johnson manage her diabetes through proper monitoring and education.',
        difficulty: 'INTERMEDIATE',
        category: 'Endocrinology',
        tags: ['diabetes', 'monitoring', 'education'],
        estimatedDuration: 20,
        content: {
          patient: {
            id: 'patient-johnson',
            name: 'Sarah Johnson',
            age: 58,
            gender: 'Female',
            chiefComplaint: 'Diabetes management and education',
          },
          visits: [
            {
              visitNumber: 1,
              tasks: [
                {
                  id: 'task-blood-sugar',
                  description: "Check Sarah's blood sugar levels",
                  type: 'procedure_blood_sugar',
                  options: [
                    {
                      text: 'Perform finger stick blood glucose test',
                      score: 75,
                      consequence: 'blood_sugar_checked',
                    },
                  ],
                },
              ],
            },
          ],
        },
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: admin.id,
      },
    }),
  ]);

  console.log('✅ Sample medical cases created:', cases.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
