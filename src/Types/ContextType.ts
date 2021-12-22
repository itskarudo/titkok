import {Redis} from "ioredis";
import {Response} from "express";
import {Connection} from "typeorm";

interface ContextType {
  res: Response,
  redis: Redis,
  conn: Connection,
  user: {
    userId: string
  }
};

export default ContextType;
