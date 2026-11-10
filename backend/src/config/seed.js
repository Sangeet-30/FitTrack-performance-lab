import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Goal from '../models/Goal.js';
import ProgressEntry from '../models/ProgressEntry.js';

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required to seed the database.');
  }

  console.log('Connecting to MongoDB Atlas at:', uri.replace(/:[^:]*@/, ':****@'));
  await mongoose.connect(uri);
  console.log('Connected to database:', mongoose.connection.name);

  // 1. Create or update Demo User
  const demoEmail = 'demo@fittrack.app';
  let demoUser = await User.findOne({ email: demoEmail });

  const passwordHash = await bcrypt.hash('password123', 12);

  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo Athlete',
      email: demoEmail,
      passwordHash,
      goal: 'Build Muscle',
      fitnessLevel: 'Intermediate',
      trainingDays: 6,
      age: 26,
      heightCm: 178,
      currentWeightKg: 74.5,
      equipment: 'Commercial Gym',
      workoutDuration: '45 min',
      workoutSplit: 'Bro Split (Chest, Back, Legs, Shoulders, Arms)',
      futureWorkoutPlan: 'Chest Hypertrophy & Density',
      nextWorkoutDay: 'Tuesday',
      units: 'kg',
      status: 'active',
    });
    console.log('Created demo user:', demoUser.email);
  } else {
    demoUser.name = 'Demo Athlete';
    demoUser.goal = 'Build Muscle';
    demoUser.fitnessLevel = 'Intermediate';
    demoUser.trainingDays = 6;
    demoUser.age = 26;
    demoUser.heightCm = 178;
    demoUser.currentWeightKg = 74.5;
    demoUser.equipment = 'Commercial Gym';
    demoUser.workoutDuration = '45 min';
    demoUser.workoutSplit = 'Bro Split (Chest, Back, Legs, Shoulders, Arms)';
    demoUser.futureWorkoutPlan = 'Chest Hypertrophy & Density';
    demoUser.nextWorkoutDay = 'Tuesday';
    demoUser.passwordHash = passwordHash;
    demoUser.status = 'active';
    await demoUser.save();
    console.log('Updated existing demo user:', demoUser.email);
  }

  const userId = demoUser._id;

  // 2. Clear old data for demo user and repopulate cleanly
  await Promise.all([
    Workout.deleteMany({ user: userId }),
    Goal.deleteMany({ user: userId }),
    ProgressEntry.deleteMany({ user: userId }),
  ]);

  const now = new Date();

  // Helper for dates in current week
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // 3. Seed Realistic Workouts
  const workoutsToSeed = [
    {
      user: userId,
      name: 'Upper Body Power',
      category: 'Strength',
      difficulty: 'Intermediate',
      durationMinutes: 45,
      totalVolume: 3240,
      caloriesBurned: 350,
      completedAt: daysAgo(0), // Today
      exercises: [
        {
          name: 'Barbell Bench Press',
          totalSets: 4,
          reps: 8,
          weight: 80,
          sets: [
            { setNumber: 1, reps: 8, weight: 70, completed: true },
            { setNumber: 2, reps: 8, weight: 75, completed: true },
            { setNumber: 3, reps: 8, weight: 80, completed: true },
            { setNumber: 4, reps: 7, weight: 80, completed: true },
          ],
        },
        {
          name: 'Incline Dumbbell Press',
          totalSets: 3,
          reps: 10,
          weight: 26,
          sets: [
            { setNumber: 1, reps: 10, weight: 24, completed: true },
            { setNumber: 2, reps: 10, weight: 26, completed: true },
            { setNumber: 3, reps: 9, weight: 26, completed: true },
          ],
        },
        {
          name: 'Cable Triceps Pushdown',
          totalSets: 3,
          reps: 12,
          weight: 35,
          sets: [
            { setNumber: 1, reps: 12, weight: 30, completed: true },
            { setNumber: 2, reps: 12, weight: 35, completed: true },
            { setNumber: 3, reps: 12, weight: 35, completed: true },
          ],
        },
      ],
      notes: 'Strong bench press session, excellent pressing form.',
    },
    {
      user: userId,
      name: 'Lower Body Strength',
      category: 'Lower Body',
      difficulty: 'Advanced',
      durationMinutes: 55,
      totalVolume: 4180,
      caloriesBurned: 440,
      completedAt: daysAgo(2),
      exercises: [
        {
          name: 'Barbell Back Squat',
          totalSets: 4,
          reps: 6,
          weight: 105,
          sets: [
            { setNumber: 1, reps: 6, weight: 95, completed: true },
            { setNumber: 2, reps: 6, weight: 100, completed: true },
            { setNumber: 3, reps: 6, weight: 105, completed: true },
            { setNumber: 4, reps: 6, weight: 105, completed: true },
          ],
        },
        {
          name: 'Romanian Deadlift',
          totalSets: 3,
          reps: 8,
          weight: 90,
          sets: [
            { setNumber: 1, reps: 8, weight: 85, completed: true },
            { setNumber: 2, reps: 8, weight: 90, completed: true },
            { setNumber: 3, reps: 8, weight: 90, completed: true },
          ],
        },
      ],
      notes: 'Depth felt consistent throughout all squat sets.',
    },
    {
      user: userId,
      name: 'Full Body Functional & Core',
      category: 'Full Body',
      difficulty: 'Intermediate',
      durationMinutes: 40,
      totalVolume: 2150,
      caloriesBurned: 320,
      completedAt: daysAgo(4),
      exercises: [
        {
          name: 'Kettlebell Swings',
          totalSets: 4,
          reps: 15,
          weight: 24,
          sets: [
            { setNumber: 1, reps: 15, weight: 24, completed: true },
            { setNumber: 2, reps: 15, weight: 24, completed: true },
            { setNumber: 3, reps: 15, weight: 24, completed: true },
            { setNumber: 4, reps: 15, weight: 24, completed: true },
          ],
        },
        {
          name: 'Pull-Ups',
          totalSets: 3,
          reps: 10,
          weight: 0,
          sets: [
            { setNumber: 1, reps: 10, weight: 0, completed: true },
            { setNumber: 2, reps: 9, weight: 0, completed: true },
            { setNumber: 3, reps: 8, weight: 0, completed: true },
          ],
        },
      ],
      notes: 'High tempo session with active recovery intervals.',
    },
  ];

  await Workout.insertMany(workoutsToSeed);
  console.log(`Seeded ${workoutsToSeed.length} workouts.`);

  // 4. Seed Active Goals
  const goalsToSeed = [
    {
      user: userId,
      title: 'Bench Press 100kg Milestone',
      category: 'Strength',
      targetValue: 100,
      currentValue: 85,
      unit: 'kg',
      dueDate: daysAgo(-30), // 30 days in future
      status: 'active',
    },
    {
      user: userId,
      title: 'Target Bodyweight Goal',
      category: 'Body',
      targetValue: 70,
      currentValue: 74,
      unit: 'kg',
      dueDate: daysAgo(-45),
      status: 'active',
    },
    {
      user: userId,
      title: 'Consistent 4x Weekly Training',
      category: 'Consistency',
      targetValue: 4,
      currentValue: 3,
      unit: 'workouts',
      dueDate: daysAgo(-7),
      status: 'active',
    },
  ];

  await Goal.insertMany(goalsToSeed);
  console.log(`Seeded ${goalsToSeed.length} goals.`);

  // 5. Seed Progress Entries
  const progressToSeed = [
    {
      user: userId,
      weightKg: 75.8,
      bodyFatPercent: 17.5,
      recordedAt: daysAgo(21),
      notes: 'Initial check-in after new training cycle.',
    },
    {
      user: userId,
      weightKg: 75.0,
      bodyFatPercent: 17.0,
      recordedAt: daysAgo(14),
      notes: 'Energy levels feeling solid.',
    },
    {
      user: userId,
      weightKg: 74.5,
      bodyFatPercent: 16.6,
      recordedAt: daysAgo(7),
      notes: 'Down 0.5kg this week, waist tightening.',
    },
    {
      user: userId,
      weightKg: 74.0,
      bodyFatPercent: 16.2,
      recordedAt: daysAgo(0),
      notes: 'On track toward 70kg target.',
    },
  ];

  await ProgressEntry.insertMany(progressToSeed);
  console.log(`Seeded ${progressToSeed.length} progress entries.`);

  console.log('✅ Database Fittrack successfully initialized and seeded on MongoDB Atlas!');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

