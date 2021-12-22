import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config";

export interface Payload {
  userId: string;
  token_version?: string;
}

export const generateAccessToken = (payload: Payload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET!, { expiresIn: "1m" });
};

export const generateRefreshToken = (payload: Payload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET!);
};
