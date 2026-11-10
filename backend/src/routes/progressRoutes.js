import { Router } from 'express';
import ProgressEntry from '../models/ProgressEntry.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';
import { progressCreateSchema, progressUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

const DEMO_PROGRESS_SAMPLE = [
  {
    _id: 'sample-prog-1',
    recordedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    weightKg: 74.5,
    bodyFatPercent: 14.5,
    measurements: { waistCm: 81, chestCm: 104, armCm: 38.5 },
    notes: 'Morning fasted, recovery on point post-hypertrophy block.',
  },
  {
    _id: 'sample-prog-2',
    recordedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    weightKg: 74.2,
    bodyFatPercent: 14.8,
    measurements: { waistCm: 81.5, chestCm: 103.5, armCm: 38 },
    notes: 'Consistent high-protein nutrition, vascularity improving.',
  },
  {
    _id: 'sample-prog-3',
    recordedAt: new Date(Date.now() - 17 * 86400000).toISOString(),
    weightKg: 73.8,
    bodyFatPercent: 15.0,
    measurements: { waistCm: 82, chestCm: 103, armCm: 37.8 },
    notes: 'Mid-mesocycle strength check. Shoulder pressing felt light.',
  },
  {
    _id: 'sample-prog-4',
    recordedAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    weightKg: 73.4,
    bodyFatPercent: 15.2,
    measurements: { waistCm: 82.5, chestCm: 102.5, armCm: 37.5 },
    notes: 'Baseline weigh-in before launching 5-day Bro Split.',
  },
];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let items = await ProgressEntry.find({ user: req.user.id })
      .sort({ recordedAt: -1 })
      .limit(365);
    if (items.length === 0 && (req.user?.isDemo || req.user?.email === 'demo@fittrack.app')) {
      items = DEMO_PROGRESS_SAMPLE;
    }
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
