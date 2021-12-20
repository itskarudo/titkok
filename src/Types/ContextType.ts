import {Redis} from "ioredis";
import {Response} from "express";

interface ContextType {
  res: Response,
  redis: Redis,
  user: {
    userId: string,
    admin: boolean
  }
};

export default ContextType;
