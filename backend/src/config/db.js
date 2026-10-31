import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env.');
  mongoose.set('strictQuery', true);
  // Disable buffering so queries fail immediately if not connected instead of hanging for 10s
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  console.info(`MongoDB connected: ${mongoose.connection.name}`);
}
