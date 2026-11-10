import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    meal: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'],
      default: 'Snack',
    },
    calories: { type: Number, min: 0, max: 20000, default: 0 },
    protein: { type: Number, min: 0, max: 1000, default: 0 },
    carbs: { type: Number, min: 0, max: 2000, default: 0 },
    fat: { type: Number, min: 0, max: 1000, default: 0 },
    consumedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true },
    items: { type: [itemSchema], default: [] },
    waterMl: { type: Number, min: 0, max: 20000, default: 0 },
    calorieTarget: { type: Number, min: 0, default: 2200 },
    proteinTarget: { type: Number, min: 0, default: 140 },
  },
  { timestamps: true, versionKey: false }
);

schema.index({ user: 1, dateKey: -1 }, { unique: true });

export default mongoose.model('NutritionLog', schema);
