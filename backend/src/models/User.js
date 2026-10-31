import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  goal: { type: String, enum: ['Build Muscle', 'Lose Fat', 'Lose Weight', 'Improve Fitness', 'Build Strength', 'Increase Strength', 'Improve Endurance', 'Maintain', 'Maintain Fitness'], default: 'Improve Fitness' },
  fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  trainingDays: { type: Number, min: 1, max: 7, default: 4 },
  age: { type: Number, min: 10, max: 100 },
  heightCm: { type: Number, min: 50, max: 260 },
  currentWeightKg: { type: Number, min: 20, max: 500 },
  equipment: { type: String, enum: ['Home Gym', 'Commercial Gym', 'Minimal Equipment', 'Bodyweight Only'] },
  workoutDuration: { type: String, enum: ['30 min', '45 min', '60 min', '75 min'], default: '45 min' },
  units: { type: String, enum: ['kg', 'lb'], default: 'kg' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
}, { timestamps: true, versionKey: false });

userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.passwordHash); };
userSchema.methods.toSafeJSON = function () {
  return { id: this.id, name: this.name, email: this.email, goal: this.goal, fitnessLevel: this.fitnessLevel, trainingDays: this.trainingDays, age: this.age, heightCm: this.heightCm, currentWeightKg: this.currentWeightKg, equipment: this.equipment, workoutDuration: this.workoutDuration, units: this.units, createdAt: this.createdAt };
};
export default mongoose.model('User', userSchema);
