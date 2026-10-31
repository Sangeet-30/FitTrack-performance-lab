import { Router } from 'express';
import ProgressEntry from '../models/ProgressEntry.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';
import { progressCreateSchema, progressUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await ProgressEntry.find({ user: req.user.id })
      .sort({ recordedAt: -1 })
      .limit(365);
    res.json({ items });
  })
);

router.post(
  '/',
  validateBody(progressCreateSchema),
  asyncHandler(async (req, res) => {
    const { recordedAt, weightKg, bodyFatPercent, measurements, notes } = req.body;
    const item = await ProgressEntry.create({
      user: req.user.id,
      recordedAt: recordedAt || new Date(),
      weightKg,
      bodyFatPercent,
      measurements,
      notes,
    });
    res.status(201).json({ item });
  })
);

router.patch(
  '/:id',
  validateObjectId('id'),
  validateBody(progressUpdateSchema),
  asyncHandler(async (req, res) => {
    const item = await ProgressEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Progress entry not found.' });
    res.json({ item });
  })
);

router.delete(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const item = await ProgressEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Progress entry not found.' });
    res.json({ message: 'Progress entry deleted.' });
  })
);

export default router;
