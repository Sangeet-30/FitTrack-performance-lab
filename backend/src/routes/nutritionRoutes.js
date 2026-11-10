import { Router } from 'express';
import NutritionLog from '../models/NutritionLog.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { nutritionUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

const DEMO_NUTRITION_SAMPLE = {
  items: [
    { name: 'Steel-Cut Oats with Whey & Blueberries', meal: 'Breakfast', calories: 520, protein: 42, carbs: 68, fat: 10 },
    { name: 'Grilled Chicken Breast, Brown Rice & Broccoli', meal: 'Lunch', calories: 680, protein: 58, carbs: 74, fat: 12 },
    { name: 'Greek Yogurt Bowl with Almonds & Honey', meal: 'Snack', calories: 290, protein: 26, carbs: 22, fat: 11 },
    { name: 'Pan-Roasted Wild Salmon & Sweet Potato', meal: 'Dinner', calories: 640, protein: 46, carbs: 52, fat: 24 },
  ],
  waterMl: 2750,
  calorieTarget: 2200,
  proteinTarget: 160,
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const to = req.query.to || from;
    const items = await NutritionLog.find({
      user: req.user.id,
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: -1 });

    if (items.length === 0 && (req.user?.isDemo || req.user?.email === 'demo@fittrack.app')) {
      return res.json({ items: [{ ...DEMO_NUTRITION_SAMPLE, dateKey: from }] });
    }

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

    const maxAllowedDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (req.params.dateKey > maxAllowedDate) {
      return res.status(400).json({ message: 'Cannot log or edit nutrition for a future date.' });
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
