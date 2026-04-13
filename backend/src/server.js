if (process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}
const app = require("./app");
const pool = require("./config/db");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    logger.info("Database connection successful");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

  } catch (error) {

    logger.error({
      message: "Failed to connect to database",
      error: error.message,
      stack: error.stack
    });

    process.exit(1); // Crash immediately
  }
}

startServer();