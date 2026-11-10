import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { profileUpdateSchema } from '../validation/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const isDemo = Boolean(req.user?.isDemo || req.user?.email === 'demo@fittrack.app');
    const userSafe = req.user.toSafeJSON();
    if (isDemo) {
      userSafe.trainingDays = 6;
      if (req.user.trainingDays !== 6 && typeof req.user.save === 'function') {
        req.user.trainingDays = 6;
        await req.user.save().catch(() => {});
      }
    }

    const requiredProfileFields = ['name', 'email', 'goal', 'fitnessLevel', 'trainingDays', 'age', 'heightCm', 'currentWeightKg'];
    const missingFields = requiredProfileFields.filter((f) => userSafe[f] == null || userSafe[f] === '');
    const completionPercent = Math.round(((requiredProfileFields.length - missingFields.length) / requiredProfileFields.length) * 100);

    res.json({
      user: userSafe,
      profileStatus: {
        isComplete: missingFields.length === 0,
        percent: completionPercent,
        missingFields,
      },
    });
  })
);

router.patch(
  '/',
  validateBody(profileUpdateSchema),
  asyncHandler(async (req, res) => {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  })
);

export default router;
