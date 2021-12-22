import { Redis } from "ioredis";
import { Request, Response } from "express";
import { Connection } from "typeorm";

interface ContextType {
  req: Request & { user: { userId: string } };
  res: Response;
  redis: Redis;
  conn: Connection;
}

export default ContextType;
