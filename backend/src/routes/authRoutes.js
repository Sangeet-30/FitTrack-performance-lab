import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  // In cross-domain production (e.g. Vercel frontend -> Render backend), sameSite must be 'none' with secure: true.
  // In development/test, use sameSite: 'lax' and secure: false.
  const sameSite = process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : (isProd || sameSite === 'none');
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

function issueToken(user, res) {
  const token = jwt.sign(
    { sub: user._id || user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  if (res) {
    res.cookie('fittrack_token', token, getCookieOptions());
  }
  return token;
}

const registerHandler = asyncHandler(async (req, res) => {
  const { name, email, password, fitnessGoal, fitnessLevel, units } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    goal: fitnessGoal || 'Improve Fitness',
    fitnessLevel: fitnessLevel || 'Beginner',
    units: units || 'kg',
  });

  issueToken(user, res);
  res.status(201).json({
    message: 'Account created successfully.',
    user: user.toSafeJSON(),
  });
});

// Support both /register and /signup
router.post('/register', validateBody(registerSchema), registerHandler);
router.post('/signup', validateBody(registerSchema), registerHandler);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    issueToken(user, res);
    res.json({
      message: 'Signed in successfully.',
      user: user.toSafeJSON(),
    });
  })
);

router.get('/me', protect, (req, res) => {
  const userSafe = req.user.toSafeJSON();
  if (req.user?.isDemo || req.user?.email === 'demo@fittrack.app') {
    userSafe.trainingDays = 6;
  }
  res.json({ user: userSafe });
});

// POST /api/auth/demo - Start Live Demo Overview session
router.post(
  '/demo',
  asyncHandler(async (req, res) => {
    if (process.env.DEMO_MODE !== 'true') {
      return res.status(403).json({ message: 'Demo mode is not enabled in this deployment.' });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const isDbConnected = req.app.get('mongoose')?.connection?.readyState === 1 || User.db?.readyState === 1;

    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: 'demo@fittrack.app' });
      if (user && user.trainingDays !== 6) {
        user.trainingDays = 6;
        await user.save().catch(() => {});
      }
      // In production, do not auto-create the demo user
      if (!user && !isProd) {
        const passwordHash = await bcrypt.hash('password123', 10);
        user = await User.create({
          name: 'Demo Athlete',
          email: 'demo@fittrack.app',
          passwordHash,
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
        });
      }
    }

    if (!user) {
      if (isProd) {
        return res.status(404).json({ message: 'Demo account is not configured in this environment.' });
      }
      user = {
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
    }

    issueToken(user, res);
    const safeUser = typeof user.toSafeJSON === 'function' ? user.toSafeJSON() : user;
    safeUser.isDemo = true;
    safeUser.demoMode = true;
    safeUser.isReadOnly = true;

    res.json({
      message: 'Demo overview session started.',
      user: safeUser,
    });
  })
);

router.post('/logout', (_req, res) => {
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie('fittrack_token', clearOptions);
  res.json({ message: 'Signed out successfully.' });
});

export default router;
