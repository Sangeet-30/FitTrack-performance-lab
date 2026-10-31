import { Router } from 'express';
import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';
import { workoutCreateSchema, workoutUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

// GET /api/workouts - List user's workouts with pagination and date filter
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    if (mongoose.connection.readyState !== 1) {
      if (req.user?.isDemo && process.env.DEMO_MODE === 'true') {
        return res.json({ items: [], pagination: { page, limit, total: 0, pages: 0 } });
      }
      return res.status(503).json({
        message: 'Database service is currently unavailable. Please check your connection and try again.',
      });
    }

    const filter = { user: req.user.id };

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.from || req.query.to) {
      filter.completedAt = {};
      if (req.query.from) filter.completedAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.completedAt.$lte = new Date(req.query.to);
    }

    const [items, total] = await Promise.all([
      Workout.find(filter)
        .sort({ completedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Workout.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// POST /api/workouts - Create a new workout session
router.post(
  '/',
  validateBody(workoutCreateSchema),
  asyncHandler(async (req, res) => {
    const {
      name,
      category = 'Strength',
      difficulty = 'Intermediate',
      durationMinutes,
      durationSeconds,
      exercises = [],
      totalVolume,
      caloriesBurned,
      perceivedEffort,
      notes = '',
      completedAt,
    } = req.body;

    const parsedDurationMin =
      durationMinutes || (durationSeconds ? Math.round(durationSeconds / 60) : 45);

    const workout = await Workout.create({
      user: req.user.id,
      name: name.trim(),
      category,
      difficulty,
      durationMinutes: parsedDurationMin,
      durationSeconds: durationSeconds || parsedDurationMin * 60,
      exercises,
      totalVolume: typeof totalVolume === 'number' ? totalVolume : 0,
      caloriesBurned:
        typeof caloriesBurned === 'number' ? caloriesBurned : Math.round(parsedDurationMin * 7.5),
      perceivedEffort,
      notes: typeof notes === 'string' ? notes.trim() : '',
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    });

    res.status(201).json({
      message: 'Workout logged successfully.',
      item: workout,
    });
  })
);

// GET /api/workouts/:id
router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const item = await Workout.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Workout not found.' });
    res.json({ item });
  })
);

// PATCH /api/workouts/:id
router.patch(
  '/:id',
  validateObjectId('id'),
  validateBody(workoutUpdateSchema),
  asyncHandler(async (req, res) => {
    const item = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Workout not found.' });
    res.json({ message: 'Workout updated.', item });
  })
);

// DELETE /api/workouts/:id
router.delete(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const item = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Workout not found.' });
    res.json({ message: 'Workout deleted successfully.' });
  })
);

export default router;
