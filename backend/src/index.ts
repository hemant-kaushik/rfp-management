import dotenv from 'dotenv';
import app from "./app";

dotenv.config();
const PORT = process.env.PORT || 5432;

//  start server
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
