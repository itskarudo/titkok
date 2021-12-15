import {AuthChecker} from "type-graphql";
import ContextType from "../Types/ContextType";

export const TKAuthChecker: AuthChecker<ContextType> = (
  {args, context: {user}},
  roles
) => {

  if (!user) return false;

  if (roles.includes("OWNER"))
  {
    if (args.userId && args.userId === user.userId)
      return true;
  }

  if (roles.includes("ADMIN"))
  {
    if (user.admin === true)
      return true;
  }

  return false;
}
