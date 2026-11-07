import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    setNumber: { type: Number, min: 1, default: 1 },
    reps: { type: Number, min: 0, max: 1000, default: 0 },
    weight: { type: Number, min: 0, max: 2000, default: 0 },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    exerciseId: { type: String, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sets: { type: [setSchema], default: [] },
    totalSets: { type: Number, min: 0, default: 1 },
    reps: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workout name is required.'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: [
        'Strength',
        'Hypertrophy',
        'Cardio',
        'Conditioning',
        'HIIT',
        'Full Body',
        'Upper Body',
        'Lower Body',
        'Legs',
        'Core',
        'Mobility',
        'Recovery',
        'Other',
      ],
      default: 'Strength',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    durationMinutes: {
      type: Number,
      min: 1,
      max: 1440,
      default: 45,
    },
    durationSeconds: {
      type: Number,
      min: 0,
      default: function () {
        return (this.durationMinutes || 45) * 60;
      },
    },
    exercises: {
      type: [exerciseSchema],
      default: [],
    },
    totalVolume: {
      type: Number,
      min: 0,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      min: 0,
      default: 0,
    },
    perceivedEffort: {
      type: Number,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
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

// Auto-calculate totalVolume if not explicitly provided
workoutSchema.pre('save', function (next) {
  if (!this.totalVolume || this.totalVolume === 0) {
    let volume = 0;
    for (const ex of this.exercises || []) {
      if (Array.isArray(ex.sets) && ex.sets.length > 0) {
        for (const s of ex.sets) {
          volume += (s.weight || 0) * (s.reps || 0);
        }
      } else if (ex.weight && (ex.reps || ex.totalSets)) {
        volume += ex.weight * (ex.reps || 1) * (ex.totalSets || 1);
      }
    }
    this.totalVolume = volume;
  }
  next();
});

workoutSchema.index({ user: 1, completedAt: -1 });

export default mongoose.model('Workout', workoutSchema);

