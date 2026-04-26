import "dotenv/config"
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import RateLimit from "express-rate-limit"
import logger from "./utils/logger.js";
import RedisConn, { rateLimiter } from "./config/redis.js"
import { sensitiveEndpointLimiter } from "./utils/senstitiveEndpointsLimiter.js"
import { waitForRedis } from "./config/redis.js"
import connectMongo from "./config/db.js"
import postRoutes from "./routes/post.route.js"
import errorHandler from "./middlewares/errorHandler.js"
const app = express()

const PORT = process.env.PORT
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use((req, res, next) => {
  logger.info(`Received ${req.method} ${req.url}`);
  logger.info(`Request Body,${req.body}`);
  next();
})

app.use((req, res, next) => {
  rateLimiter.consume(req.ip).then(() => next()).catch(() => {
    logger.warn(`Rate limit exceeded for IP:${req.ip}`)
    res.status(429).json({ success: false, message: "Too many requests" })
  });
})

app.use('/api/posts', sensitiveEndpointLimiter, postRoutes)
app.use(errorHandler)
app.use((err, req, res, next) => {
  logger.error("Request Error", {
    message: err.message,
    stack: err.stack,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

async function startServer() {
  try {
    logger.info("🚀 Starting application...");

    // 1. Connect MongoDB
    await connectMongo();
    logger.info("✅ MongoDB connected");

    // 2. Wait for Redis
    await waitForRedis();
    logger.info("✅ Redis ready");

    // 3. Start server
    const server = app.listen(PORT, () => {
      logger.info(`🌍 Server running on http://localhost:${PORT}`);
    });

    // 5. Graceful shutdown
    const shutdown = async (signal) => {
      logger.warn(`⚠️ Received ${signal}. Shutting down gracefully...`);

      const forceExit = setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10_000).unref();

      server.close(async () => {
        try {
          logger.info("HTTP server closed");
          logger.info("Shutdown complete");
          clearTimeout(forceExit);
          process.exit(0);
        } catch (err) {
          logger.error("Error during shutdown", { message: err.message, stack: err.stack });
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    logger.error("❌ Startup failed", err);
    process.exit(1);
  }
}


process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { promise, reason });
  process.exit(1);
});


process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

startServer();