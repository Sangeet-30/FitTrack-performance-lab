import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
let serverInstance = null;

function startServer() {
  if (!serverInstance) {
    serverInstance = app.listen(port, () => {
      console.info(`FitTrack API listening on port ${port}`);
    });
  }
  return serverInstance;
}

// Graceful shutdown handling for container recycling (Render, Railway, Docker)
const handleShutdown = async (signal) => {
  console.info(`Received ${signal}. Gracefully terminating FitTrack API...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.info('HTTP server terminated.');
      try {
        await mongoose.connection.close(false);
        console.info('MongoDB connection closed.');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Connect to MongoDB Atlas and start HTTP server
connectDB()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.error(`MongoDB connection error: ${error.message}`);
    // Start server so health checks and local testing still function
    startServer();
  });

export default app;
