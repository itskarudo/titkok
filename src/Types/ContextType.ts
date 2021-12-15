import {Redis} from "ioredis";

interface ContextType {
  redis: Redis,
  user: {
    userId: string,
    admin: boolean
  }
};

export default ContextType;
