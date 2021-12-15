import jwt from "jsonwebtoken";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export interface Payload {
  userId: string,
  token_version?: string,
  admin?: boolean
};

export const generateAccessToken = (payload: Payload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET!, {expiresIn: "1m"});
}

export const generateRefreshToken = (payload: Payload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET!);
}

