import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required.'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: ['Strength', 'Body', 'Nutrition', 'Consistency', 'Cardio', 'Other'],
      default: 'Strength',
    },
    targetValue: {
      type: Number,
      min: 0,
      required: [true, 'Target value is required.'],
    },
    currentValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 24,
      default: 'kg',
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

goalSchema.virtual('progressPercent').get(function () {
  if (!this.targetValue || this.targetValue <= 0) return 0;
  const pct = Math.round(((this.currentValue || 0) / this.targetValue) * 100);
  return Math.min(Math.max(pct, 0), 100);
});

goalSchema.index({ user: 1, status: 1, dueDate: 1 });

export default mongoose.model('Goal', goalSchema);
