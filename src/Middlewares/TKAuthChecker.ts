import { AuthChecker } from "type-graphql";
import ContextType from "../Types/ContextType";
import { ACCESS_TOKEN_SECRET } from "../config";
import jwt from "jsonwebtoken";

export const TKAuthChecker: AuthChecker<ContextType> = (
  { context: { req } },
  _
) => {
  let token: string | null = null;
  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(" ");
    if (parts.length == 2 && /^Bearer$/i.test(parts[0])) token = parts[1];
  }

  if (!token) return false;

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET!) as { userId: string };
    req["user"] = user;
    return true;
  } catch (e) {
    return false;
  }
};
