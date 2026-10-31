import 'dotenv/config';
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
