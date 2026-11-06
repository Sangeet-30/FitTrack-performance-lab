import { Router } from 'express';
import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

const getSampleDashboardData = (user) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);

  const weeklyActivity = dayNames.map((name, index) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + index);
    const dayDateStr = d.toISOString().slice(0, 10);
    const done = index === 0 || index === 2 || index === 4;
    return {
      day: name,
      date: dayDateStr,
      done,
      count: done ? 1 : 0,
      volume: done ? 2850 : 0,
    };
  });

  return {
    user: {
      id: user?.id || 'demo-user',
      name: user?.name || 'Demo User',
      email: user?.email || 'demo@fittrack.app',
      goal: user?.goal || 'Build Muscle',
      fitnessLevel: user?.fitnessLevel || 'Intermediate',
      workoutSplit: user?.workoutSplit || 'Push / Pull / Legs',
      futureWorkoutPlan: user?.futureWorkoutPlan || 'Chest & Triceps Hypertrophy',
      nextWorkoutDay: user?.nextWorkoutDay || 'Tomorrow',
      units: user?.units || 'kg',
      currentWeightKg: user?.currentWeightKg || 72,
    },
    stats: {
      weeklyWorkoutsCount: 3,
      weeklyGoalTarget: user?.trainingDays || 4,
      streakDays: 5,
      monthlyVolumeKg: 12450,
      totalWorkoutCount: 18,
      currentWeight: user?.currentWeightKg || 72,
      targetWeight: 68,
    },
    weeklyActivity,
    recentWorkouts: [
      {
        _id: 'sample-w1',
        name: 'Upper Body Hypertrophy',
        category: 'Strength',
        durationMinutes: 55,
        totalVolume: 4200,
        exerciseCount: 5,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: 'sample-w2',
        name: 'High Intensity Intervals & Core',
        category: 'Cardio',
        durationMinutes: 35,
        totalVolume: 0,
        exerciseCount: 6,
        completedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        _id: 'sample-w3',
        name: 'Posterior Chain & Deadlifts',
        category: 'Strength',
        durationMinutes: 60,
        totalVolume: 5100,
        exerciseCount: 4,
        completedAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    activeGoals: [
      {
        _id: 'sample-g1',
        title: 'Reach 100kg Bench Press',
        category: 'Strength',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        progressPercent: 85,
      },
      {
        _id: 'sample-g2',
        title: '4 Weekly Workout Sessions',
        category: 'Habit',
        targetValue: 4,
        currentValue: 3,
        unit: 'sessions',
        progressPercent: 75,
      },
      {
        _id: 'sample-g3',
        title: 'Target Bodyweight 68 kg',
        category: 'Body',
        targetValue: 68,
        currentValue: 72,
        unit: 'kg',
        progressPercent: 60,
      },
    ],
  };
};

// GET /api/dashboard - Aggregated stats for the user
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Check MongoDB connectivity
    if (mongoose.connection.readyState !== 1) {
      if (req.user?.isDemo && process.env.DEMO_MODE === 'true') {
        return res.json(getSampleDashboardData(req.user));
      }
      return res.status(503).json({
        message: 'Database service is currently unavailable. Please check your connection and try again.',
      });
    }

    try {
      const userId = req.user.id;
      const now = new Date();

      // Calculate start of current week (Monday)
      const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Calculate start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch user's data concurrently
      const [recentWorkouts, activeGoals, weekWorkouts, monthWorkouts, totalWorkoutCount] = await Promise.all([
        Workout.find({ user: userId })
          .sort({ completedAt: -1, createdAt: -1 })
          .limit(5)
          .lean(),
        Goal.find({ user: userId, status: 'active' })
          .sort({ dueDate: 1, createdAt: -1 })
          .limit(4)
          .lean(),
        Workout.find({
          user: userId,
          completedAt: { $gte: startOfWeek, $lt: endOfWeek },
        })
          .select('completedAt totalVolume durationMinutes')
          .lean(),
        Workout.find({
          user: userId,
          completedAt: { $gte: startOfMonth },
        })
          .select('totalVolume')
          .lean(),
        Workout.countDocuments({ user: userId }),
      ]);

      // Build weekly activity grid (Mon - Sun)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyActivity = dayNames.map((name, index) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + index);
        const dayDateStr = d.toISOString().slice(0, 10);

        const workoutsOnDay = weekWorkouts.filter((w) => {
          const wDate = new Date(w.completedAt).toISOString().slice(0, 10);
          return wDate === dayDateStr;
        });

        return {
          day: name,
          date: dayDateStr,
          done: workoutsOnDay.length > 0,
          count: workoutsOnDay.length,
        };
      });

      // Calculate monthly volume
      const monthlyVolumeKg = monthWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

      // Calculate streak (consecutive days with completed workouts backwards from today/yesterday)
      let streakDays = 0;
      const allWorkoutDates = await Workout.find({ user: userId })
        .sort({ completedAt: -1 })
        .limit(60)
        .select('completedAt')
        .lean();

      if (allWorkoutDates.length > 0) {
        const uniqueDays = new Set(
          allWorkoutDates.map((w) => new Date(w.completedAt).toISOString().slice(0, 10))
        );
        const checkDate = new Date(now);
        const todayStr = checkDate.toISOString().slice(0, 10);

        // If no workout today, check if yesterday was done
        if (!uniqueDays.has(todayStr)) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (uniqueDays.has(checkDate.toISOString().slice(0, 10))) {
          streakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Weight goal if present
      const weightGoal = activeGoals.find((g) => g.category === 'Body' || /weight/i.test(g.title));

      const requiredProfileFields = ['name', 'email', 'goal', 'fitnessLevel', 'trainingDays', 'age', 'heightCm', 'currentWeightKg'];
      const missingFields = requiredProfileFields.filter((f) => req.user[f] == null || req.user[f] === '');
      const completionPercent = Math.round(((requiredProfileFields.length - missingFields.length) / requiredProfileFields.length) * 100);

      res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          goal: req.user.goal,
          fitnessLevel: req.user.fitnessLevel,
          workoutSplit: req.user.workoutSplit || 'Push / Pull / Legs',
          futureWorkoutPlan: req.user.futureWorkoutPlan || '',
          nextWorkoutDay: req.user.nextWorkoutDay || '',
          units: req.user.units || 'kg',
          currentWeightKg: req.user.currentWeightKg ?? null,
          trainingDays: req.user.trainingDays || 4,
          workoutDuration: req.user.workoutDuration || '45 min',
          equipment: req.user.equipment || null,
        },
        profileStatus: {
          isComplete: missingFields.length === 0,
          percent: completionPercent,
          missingFields,
        },
        stats: {
          weeklyWorkoutsCount: weekWorkouts.length,
          weeklyGoalTarget: req.user.trainingDays || 4,
          streakDays,
          monthlyVolumeKg,
          totalWorkoutCount,
          currentWeight: req.user.currentWeightKg ?? null,
          targetWeight: weightGoal ? weightGoal.targetValue : null,
        },
        weeklyActivity,
        recentWorkouts: recentWorkouts.map((w) => ({
          _id: w._id,
          name: w.name,
          category: w.category,
          durationMinutes: w.durationMinutes || Math.round((w.durationSeconds || 0) / 60) || 45,
          totalVolume: w.totalVolume || 0,
          exerciseCount: w.exercises ? w.exercises.length : 0,
          completedAt: w.completedAt,
        })),
        activeGoals: activeGoals.map((g) => {
          const target = g.targetValue || 1;
          const current = g.currentValue || 0;
          const progress = Math.min(Math.max(Math.round((current / target) * 100), 0), 100);
          return {
            ...g,
            progressPercent: progress,
          };
        }),
      });
    } catch (error) {
      if (req.user?.isDemo && process.env.DEMO_MODE === 'true') {
        console.warn('Dashboard DB query failed for demo user, falling back to sample data:', error.message);
        return res.json(getSampleDashboardData(req.user));
      }
      throw error;
    }
  })
);

export default router;
