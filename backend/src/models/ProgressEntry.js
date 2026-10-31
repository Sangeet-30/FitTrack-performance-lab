import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, recordedAt: { type: Date, default: Date.now }, weightKg: { type: Number, min: 20, max: 500 }, bodyFatPercent: { type: Number, min: 1, max: 75 }, measurements: { chest: Number, waist: Number, hips: Number, leftArm: Number, rightArm: Number, leftThigh: Number, rightThigh: Number }, notes: { type: String, maxlength: 1000, default: '' } }, { timestamps: true, versionKey: false });
schema.index({ user: 1, recordedAt: -1 });
export default mongoose.model('ProgressEntry', schema);
