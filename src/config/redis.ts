import { loadEnv } from "./envs";
import { createClient } from "redis";

loadEnv();

export const DEFAULT_EXP = 1800;

const redis = createClient({
  url: process.env.REDIS_URL
})

export async function connectRedis () {
  return await redis.connect();
}

export async function disconnectRedis() {
  return await redis.disconnect();
}

export default redis;