import Redis from "ioredis";
import "dotenv/config";
import logger from "../utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";

export const client = new Redis(process.env.REDIS_URL);

export const rateLimiter = new RateLimiterRedis({
  storeClient: client,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});


client.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

client.on("error", (err) => {
  logger.error("Redis client error occurred", err);

});

export const waitForRedis = async () => {
  if (client.status === "ready") {
    return;
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      client.off("end", onEnd);
      resolve();
    };
    const onEnd = () => {
      client.off("ready", onReady);
      reject(new Error("Redis connection ended before becoming ready"));
    };
    client.once("ready", onReady);
    client.once("end", onEnd);
  });
};

export default client;