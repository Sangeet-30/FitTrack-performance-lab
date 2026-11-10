import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(2, 'Name must contain at least 2 characters.')
    .max(80, 'Name cannot exceed 80 characters.'),
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .email('Enter a valid email address.')
    .max(254, 'Email cannot exceed 254 characters.'),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least 1 number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special symbol (e.g. !@#$%^&*).'),
  fitnessGoal: z
    .enum([
      'Build Muscle',
      'Lose Fat',
      'Lose Weight',
      'Improve Fitness',
      'Build Strength',
      'Increase Strength',
      'Improve Endurance',
      'Maintain',
      'Maintain Fitness',
    ])
    .optional(),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  units: z.enum(['kg', 'lb']).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required.' })
    .trim()
    .email('Enter a valid email address.'),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

const exerciseItemSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required.'),
  exerciseId: z.string().optional(),
  totalSets: z.number().int().min(1).default(3),
  reps: z.number().int().min(0).default(10),
  weight: z.number().min(0).default(0),
  sets: z
    .array(
      z.object({
        setNumber: z.number().int().optional(),
        reps: z.number().int().min(0).default(0),
        weight: z.number().min(0).default(0),
        completed: z.boolean().default(true),
      })
    )
    .optional(),
});

const notInFuture = (val) => {
  if (!val) return true;
  const d = new Date(val);
  // Allow today across any timezone (+24h buffer for UTC differences) but disallow future dates
  return !isNaN(d.getTime()) && d.getTime() <= Date.now() + 24 * 60 * 60 * 1000;
};

export const workoutCreateSchema = z.object({
  name: z
    .string({ error: 'Workout name is required.' })
    .trim()
    .min(1, 'Workout name is required.')
    .max(120),
  category: z
    .enum([
      'Strength',
      'Hypertrophy',
      'Cardio',
      'Conditioning',
      'HIIT',
      'Full Body',
      'Upper Body',
      'Lower Body',
      'Legs',
      'Core',
      'Mobility',
      'Recovery',
      'Other',
    ])
    .default('Strength'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  durationMinutes: z.number().min(1).max(600).optional(),
  durationSeconds: z.number().min(1).max(36000).optional(),
  exercises: z.array(z.union([z.string(), exerciseItemSchema])).default([]),
  totalVolume: z.number().min(0).optional(),
  caloriesBurned: z.number().min(0).optional(),
  perceivedEffort: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).default(''),
  completedAt: z
    .union([z.string().datetime(), z.string().date(), z.string()])
    .optional()
    .refine(notInFuture, { message: 'Workout date cannot be in the future.' }),
});

export const workoutUpdateSchema = workoutCreateSchema.partial();

export const goalCreateSchema = z.object({
  title: z.string({ error: 'Goal title is required.' }).trim().min(1, 'Goal title is required.').max(120),
  category: z.string().trim().default('Strength'),
  targetValue: z.number({ error: 'Target value is required.' }).positive('Target value must be positive.'),
  currentValue: z.number().min(0).default(0),
  unit: z.string().trim().max(20).default('kg'),
  dueDate: z.union([z.string(), z.date()]).optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
});

export const goalUpdateSchema = goalCreateSchema.partial();

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(80).optional(),
  goal: z
    .enum([
      'Build Muscle',
      'Lose Fat',
      'Lose Weight',
      'Improve Fitness',
      'Build Strength',
      'Increase Strength',
      'Improve Endurance',
      'Maintain',
      'Maintain Fitness',
    ])
    .optional(),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  trainingDays: z.number().int().min(1).max(7).optional(),
  units: z.enum(['kg', 'lb']).optional(),
  age: z.number().int().min(10).max(120).optional(),
  heightCm: z.number().min(50).max(260).optional(),
  currentWeightKg: z.number().min(20).max(500).optional(),
  equipment: z.enum(['Home Gym', 'Commercial Gym', 'Minimal Equipment', 'Bodyweight Only']).optional(),
  workoutDuration: z.enum(['30 min', '45 min', '60 min', '75 min']).optional(),
  workoutSplit: z.string().trim().max(100).optional(),
  futureWorkoutPlan: z.string().trim().max(200).optional(),
  nextWorkoutDay: z.string().trim().max(50).optional(),
});

export const nutritionUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Item name is required.'),
        meal: z
          .enum(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'])
          .default('Snack')
          .optional(),
        calories: z.number().min(0).default(0),
        protein: z.number().min(0).default(0),
        carbs: z.number().min(0).default(0),
        fat: z.number().min(0).default(0),
        consumedAt: z.union([z.string(), z.date()]).optional(),
      })
    )
    .optional(),
  waterMl: z.number().min(0).optional(),
  calorieTarget: z.number().min(0).optional(),
  proteinTarget: z.number().min(0).optional(),
});

export const progressCreateSchema = z.object({
  recordedAt: z
    .union([z.string(), z.date()])
    .optional()
    .refine(notInFuture, { message: 'Progress checkpoint date cannot be in the future.' }),
  weightKg: z.number().min(20).max(500).optional(),
  bodyFatPercent: z.number().min(1).max(70).optional(),
  measurements: z.record(z.any()).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.weightKg != null || data.bodyFatPercent != null || (data.measurements && Object.keys(data.measurements).length > 0),
  { message: 'Provide at least one measurement: weight, body fat %, or tape measurements.' }
);

export const progressUpdateSchema = z.object({
  recordedAt: z
    .union([z.string(), z.date()])
    .optional()
    .refine(notInFuture, { message: 'Progress checkpoint date cannot be in the future.' }),
  weightKg: z.number().min(20).max(500).optional(),
  bodyFatPercent: z.number().min(1).max(70).optional(),
  measurements: z.record(z.any()).optional(),
  notes: z.string().max(1000).optional(),
});
