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

    // If currentValue >= targetValue, auto-complete if not explicitly specified
    if (update.currentValue !== undefined && update.targetValue !== undefined) {
      if (Number(update.currentValue) >= Number(update.targetValue) && !update.status) {
        update.status = 'completed';
      }
    }

    const item = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

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
