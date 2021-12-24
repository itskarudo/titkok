import "dotenv/config";

export const __prod__ = false;
export const {
  PORT,
  REDIS_URL,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
} = process.env;
