import {
  Field,
  Resolver,
  Query,
  Arg,
  Mutation,
  ObjectType,
  InputType,
  Authorized,
  Ctx
} from "type-graphql";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { IsEmail, Length } from "class-validator";
import User from "../Types/User";
import {generateAccessToken, generateRefreshToken} from "../Utils/tokens";
import ContextType from "../Types/ContextType";

@InputType()
class UserPasswordInput {
  @Length(4, 25)
  @Field()
  username: string;

  @IsEmail()
  @Field()
  email: string;

  @Field()
  @Length(8)
  password: string;
}

@ObjectType()
class UserToken {
  @Field()
  access_token: string;
  @Field()
  refresh_token: string;
}

@Resolver(() => User)
class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Query(() => User, { nullable: true })
  user(@Arg("id") id: string): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Authorized("OWNER", "ADMIN")
  @Query(() => String)
  userId(@Arg("userId") id: string): string {
    return id;
  }

  @Mutation(() => User)
  async register(@Arg("options") options: UserPasswordInput, @Ctx() {redis}: ContextType): Promise<User> {
    const hashedPassword = await argon2.hash(options.password);

    try {
      const uuid = uuidv4();
      const user = await User.create({
        id: uuid,
        username: options.username,
        email: options.email,
        password: hashedPassword,
        admin: false,
        token_version: 1
      }).save();

      await redis.set(uuid, 1);

      return user;
    } catch (e) {
      // TODO: better error handling for fuck's sake, this is disgusting

      if (e.code === "23505") {
        if (e.detail.includes("username")) throw new Error("USERNAME_TAKEN");
        else if (e.detail.includes("email")) throw new Error("EMAIL_TAKEN");
        else throw new Error("INTERNAL_SERVER_ERROR");
      } else {
        throw new Error("INTERNAL_SERVER_ERROR");
      }
    }
  }

  @Mutation(() => UserToken)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() {redis}: ContextType
  ): Promise<UserToken> {
    const user = await User.findOne({ username });
    if (!user) throw new Error("USERNAME_OR_PASSWORD_INVALID");

    let passwords_match = await argon2.verify(user.password, password);

    if (!passwords_match) throw new Error("USERNAME_OR_PASSWORD_INVALID");

    // everything cool, do jwt magic stuff
    
    const token_version = await redis.get(user.id) as string;

    // TODO: check if there is no token in redis, this shouldn't happen
    //        if we're this fair in the login process, but better safe then sorry

    const access_token = generateAccessToken({userId: user.id, admin: user.admin});
    const refresh_token = generateRefreshToken({userId: user.id, token_version: token_version});

    return { access_token, refresh_token };
  }
}

export default UserResolver;

