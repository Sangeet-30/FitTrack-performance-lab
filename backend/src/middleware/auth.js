import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const fallbackDemoUser = {
  _id: '671ee27c0000000000000001',
  id: '671ee27c0000000000000001',
  name: 'Demo Athlete',
  email: 'demo@fittrack.app',
  goal: 'Build Muscle',
  fitnessLevel: 'Intermediate',
  trainingDays: 6,
  units: 'kg',
  currentWeightKg: 74.5,
  age: 26,
  heightCm: 178,
  equipment: 'Commercial Gym',
  workoutDuration: '45 min',
  workoutSplit: 'Bro Split (Chest, Back, Legs, Shoulders, Arms)',
  futureWorkoutPlan: 'Chest Hypertrophy & Density',
  nextWorkoutDay: 'Tuesday',
  isDemo: true,
  status: 'active',
  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      goal: this.goal,
      fitnessLevel: this.fitnessLevel,
      trainingDays: this.trainingDays,
      units: this.units,
      currentWeightKg: this.currentWeightKg,
      age: this.age,
      heightCm: this.heightCm,
      equipment: this.equipment,
      workoutDuration: this.workoutDuration,
      workoutSplit: this.workoutSplit,
      futureWorkoutPlan: this.futureWorkoutPlan,
      nextWorkoutDay: this.nextWorkoutDay,
      isDemo: true,
      demoMode: true,
    };
  },
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.fittrack_token || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const isDemoEnabled = process.env.DEMO_MODE === 'true';

  // Verify JWT signature
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
  }

  // Database availability check
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    // Only permit fallback if this is the demo account AND DEMO_MODE=true is explicitly set
    if (isDemoEnabled && (payload.email === 'demo@fittrack.app' || payload.sub === fallbackDemoUser.id)) {
      req.user = fallbackDemoUser;
      req.user.isDemo = true;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.path.includes('logout')) {
        return res.status(403).json({
          message: 'FitTrack Live Demo is in read-only overview mode. Creating or modifying data is disabled.',
        });
      }
      return next();
    }

    // In production or for real users, return clear 503 instead of fake sample data
    return res.status(503).json({
      message: 'Database service is currently unavailable. Please check your connection and try again.',
    });
  }

  // Look up user from database
  let user = null;
  try {
    user = await User.findById(payload.sub).select('-passwordHash').maxTimeMS(3000);
  } catch (err) {
    console.warn('User lookup query failed:', err.message);
  }

  if (!user || user.status !== 'active') {
    return res.status(401).json({ message: 'Account is unavailable or deactivated.' });
  }

  req.user = user;

  if (user.email === 'demo@fittrack.app') {
    if (!isDemoEnabled) {
      return res.status(403).json({ message: 'Demo mode is not enabled in this deployment.' });
    }
    req.user.isDemo = true;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.path.includes('logout')) {
      return res.status(403).json({
        message: 'FitTrack Live Demo is in read-only overview mode. Creating or modifying data is disabled.',
      });
    }
  }

  next();
});
