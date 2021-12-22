import {AuthChecker} from "type-graphql";
import ContextType from "../Types/ContextType";

export const TKAuthChecker: AuthChecker<ContextType> = (
  {context: {user}},
  _
) => !!user;
