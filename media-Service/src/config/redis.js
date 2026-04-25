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

export function waitForRedis() {
  return new Promise((resolve, reject) => {
    if (client.status === "ready") {
      resolve();
    } else {
      client.once("ready", resolve);
      client.once("error", reject);
    }
  });
}

export default client;