import { Router } from 'express';
import NutritionLog from '../models/NutritionLog.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { nutritionUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const to = req.query.to || from;
    const items = await NutritionLog.find({
      user: req.user.id,
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: -1 });
    res.json({ items });
  })
);

router.put(
  '/:dateKey',
  validateBody(nutritionUpdateSchema),
  asyncHandler(async (req, res) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.dateKey)) {
      return res.status(400).json({ message: 'Date must use YYYY-MM-DD.' });
    }

    const update = {};
    for (const key of ['items', 'waterMl', 'calorieTarget', 'proteinTarget']) {
      if (req.body?.[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    const item = await NutritionLog.findOneAndUpdate(
      { user: req.user.id, dateKey: req.params.dateKey },
      {
        $set: update,
        $setOnInsert: { user: req.user.id, dateKey: req.params.dateKey },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ item });
  })
);

export default router;
