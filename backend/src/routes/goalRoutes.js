import { Router } from 'express';
import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';
import { goalCreateSchema, goalUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

// GET /api/goals - List user's goals
router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      if (req.user?.isDemo && process.env.DEMO_MODE === 'true') {
        return res.json({ items: [] });
      }
      return res.status(503).json({
        message: 'Database service is currently unavailable. Please check your connection and try again.',
      });
    }

    const filter = { user: req.user.id };
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const items = await Goal.find(filter).sort({ status: 1, dueDate: 1, createdAt: -1 });
    res.json({ items });
  })
);

// POST /api/goals - Create a new goal
router.post(
  '/',
  validateBody(goalCreateSchema),
  asyncHandler(async (req, res) => {
    const { title, category = 'Strength', targetValue, currentValue = 0, unit = 'kg', dueDate, status } = req.body;

    const item = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      category,
      targetValue,
      currentValue,
      unit: (unit || 'kg').trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: status || 'active',
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
    const effectiveCurrent = update.currentValue !== undefined ? Number(update.currentValue) : Number(existing.currentValue);

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
