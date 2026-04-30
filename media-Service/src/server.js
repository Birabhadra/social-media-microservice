import "dotenv/config"
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import RateLimit from "express-rate-limit"
import logger from "./utils/logger.js";
import RedisConn, { rateLimiter } from "./config/redis.js"
import { connectRabbitMQ, closeRabbitMQ } from "./config/rabbitmq.js"
import { sensitiveEndpointLimiter } from "./utils/senstitiveEndpointsLimiter.js"
import { waitForRedis } from "./config/redis.js"
import connectMongo from "./config/db.js"
import MediaRoutes from "./routes/mediaRouter.js"
import errorHandler from "./middlewares/errorHandler.js"
import crypto from "crypto";

if (!global.crypto) {
  global.crypto = crypto;
}
const app = express()

const PORT = process.env.PORT || 3003
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use((req, res, next) => {
  logger.info(`Received ${req.method} ${req.url}`);
  next();
})

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        logger.error("Rate limiter backend error", { message: rejRes.message });
        return next(); // fail-open; or return 503 if you prefer fail-closed
      }
      logger.warn(`Rate limit exceeded for IP:${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
})
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


app.use('/api/media', sensitiveEndpointLimiter, MediaRoutes)
app.use(errorHandler)



async function startServer() {
  try {
    logger.info("🚀 Starting application...");

    // 1. Connect MongoDB
    await connectMongo();
    logger.info("✅ MongoDB connected");

    // 2. Wait for Redis
    await waitForRedis();
    logger.info("✅ Redis ready");

    // 3. Connect RabbitMQ
    await connectRabbitMQ();
    logger.info("✅ RabbitMQ connected");

    // 4. Start server
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
          await closeRabbitMQ();
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
