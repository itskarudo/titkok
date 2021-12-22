import ContextType from "src/Types/ContextType";
import {
  Query,
  Ctx,
  Resolver,
  Arg,
  Mutation,
  InputType,
  Field,
  Authorized
} from "type-graphql";
import User from "../Types/User";

@Resolver(() => User)
class UserResolver {

  @Query(() => User, { nullable: true })
  userProfile(@Arg("userId") userId: string): Promise<User | undefined> {
    return User.findOne(userId);
  }

}

export default UserResolver;

