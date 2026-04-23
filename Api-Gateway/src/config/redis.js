import Redis from "ioredis";
import "dotenv/config";
import logger from "../utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is missing");
}
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
    const onReady = () => { client.off("error", onError); resolve(); };
    const onError = (err) => { client.off("ready", onReady); reject(err); };
    client.once("ready", onReady);
    client.once("error", onError);
  });
}
export default client;