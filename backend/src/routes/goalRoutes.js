import { Router } from 'express';
import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';
import { goalCreateSchema, goalUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

const DEMO_GOALS_SAMPLE = [
  {
    _id: 'sample-goal-1',
    title: 'Reach 100 kg Bench Press',
    category: 'Strength',
    targetValue: 100,
    currentValue: 80,
    unit: 'kg',
    status: 'active',
  },
  {
    _id: 'sample-goal-2',
    title: 'Squat 140 kg with Clean Depth',
    category: 'Strength',
    targetValue: 140,
    currentValue: 125,
    unit: 'kg',
    status: 'active',
  },
  {
    _id: 'sample-goal-3',
    title: 'Conventional Deadlift 180 kg',
    category: 'Strength',
    targetValue: 180,
    currentValue: 160,
    unit: 'kg',
    status: 'active',
  },
  {
    _id: 'sample-goal-4',
    title: 'Maintain 6 Training Sessions / Wk',
    category: 'Habit',
    targetValue: 6,
    currentValue: 5,
    unit: 'sessions',
    status: 'active',
  },
  {
    _id: 'sample-goal-5',
    title: 'Target Bodyweight 74 kg Lean',
    category: 'Body',
    targetValue: 74,
    currentValue: 74.5,
    unit: 'kg',
    status: 'active',
  },
  {
    _id: 'sample-goal-6',
    title: 'Overhead Barbell Press 65 kg',
    category: 'Strength',
    targetValue: 65,
    currentValue: 65,
    unit: 'kg',
    status: 'completed',
  },
];

// GET /api/goals - List user's goals
router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      if ((req.user?.isDemo || req.user?.email === 'demo@fittrack.app') && process.env.DEMO_MODE === 'true') {
        const filtered = DEMO_GOALS_SAMPLE.filter(
          (g) => !req.query.status || req.query.status === 'all' || g.status === req.query.status
        );
        return res.json({ items: filtered });
      }
      return res.status(503).json({
        message: 'Database service is currently unavailable. Please check your connection and try again.',
      });
    }

    const filter = { user: req.user.id };
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    let items = await Goal.find(filter).sort({ status: 1, dueDate: 1, createdAt: -1 });
    if (items.length === 0 && (req.user?.isDemo || req.user?.email === 'demo@fittrack.app')) {
      items = DEMO_GOALS_SAMPLE.filter(
        (g) => !req.query.status || req.query.status === 'all' || g.status === req.query.status
      );
    }
    res.json({ items });
  })
);

// POST /api/goals - Create a new goal
router.post(
  '/',
  validateBody(goalCreateSchema),
  asyncHandler(async (req, res) => {
    const { title, category = 'Strength', targetValue, currentValue = 0, unit = 'kg', dueDate, status } = req.body;

    const parsedTarget = Number(targetValue) || 0;
    let parsedCurrent = Number(currentValue) || 0;
    let finalStatus = status || 'active';

    // Prevent current value from exceeding target value (no 82/80 kg)
    if (parsedTarget > 0 && parsedCurrent > parsedTarget) {
      parsedCurrent = parsedTarget;
    }

    // Auto-mark completed when target is met or exceeded
    if (parsedTarget > 0 && parsedCurrent >= parsedTarget) {
      finalStatus = 'completed';
    }

    const item = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      category,
      targetValue: parsedTarget,
      currentValue: parsedCurrent,
      unit: (unit || 'kg').trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: finalStatus,
    });

    res.status(201).json({
      message: 'Goal created successfully.',
      item,
    });
  })
);

// PATCH /api/goals/:id - Update goal details or progress
router.patch(
  '/:id',
  validateObjectId('id'),
  validateBody(goalUpdateSchema),
  asyncHandler(async (req, res) => {
    const update = { ...req.body };

    const existing = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    const effectiveTarget = update.targetValue !== undefined ? Number(update.targetValue) : Number(existing.targetValue);
    let effectiveCurrent = update.currentValue !== undefined ? Number(update.currentValue) : Number(existing.currentValue);

    // Prevent current value from exceeding target value (no 82/80 kg)
    if (effectiveTarget > 0 && effectiveCurrent > effectiveTarget) {
      effectiveCurrent = effectiveTarget;
      update.currentValue = effectiveTarget;
    }

    // If an explicit status was provided (e.g. user toggled Reopen or Mark Complete), respect it.
    // Otherwise, auto-complete when progress meets or exceeds the stored target value.
    if (!update.status) {
      if (effectiveTarget > 0 && effectiveCurrent >= effectiveTarget) {
        update.status = 'completed';
      } else if (existing.status === 'completed' && effectiveCurrent < effectiveTarget && update.currentValue !== undefined) {
        update.status = 'active';
      }
    }

    Object.assign(existing, update);
    const item = await existing.save();

    res.json({
      message: 'Goal updated successfully.',
      item,
    });
  })
);

// DELETE /api/goals/:id
router.delete(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const item = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    res.json({ message: 'Goal deleted successfully.' });
  })
);

export default router;
