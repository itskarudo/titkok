import ContextType from "src/Types/ContextType";
import {
  Query,
  Ctx,
  Resolver,
  Arg,
  Mutation,
  InputType,
  Field,
  Authorized,
} from "type-graphql";
import { GraphQLUpload } from "graphql-upload";
import { Length, MaxLength, IsEmail, IsDate } from "class-validator";
import argon2 from "argon2";
import User, { UserAttraction, UserGender } from "../Types/User";
import UploadType from "../Types/UploadType";
import { createWriteStream } from "fs";
import path from "path/posix";
import { v4 as uuidv4 } from "uuid";

@InputType()
class EditProfileInput {
  @Length(4, 24)
  @Field({ nullable: true })
  username?: string;

  @IsEmail()
  @Field({ nullable: true })
  email?: string;

  @Length(8)
  @Field({ nullable: true })
  old_password?: string;

  @Length(8)
  @Field({ nullable: true })
  password?: string;

  @Length(8)
  @Field({ nullable: true })
  password_confirmation?: string;

  @MaxLength(140)
  @Field({ nullable: true })
  bio?: string;

  @IsDate()
  @Field({ nullable: true })
  date_of_birth?: Date;

  @Field(() => UserAttraction, { nullable: true })
  attraction?: UserAttraction;

  @Field(() => UserGender, { nullable: true })
  gender?: UserGender;

  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<UploadType>;
}

@Resolver(() => User)
class UserResolver {
  @Query(() => User, { nullable: true })
  userProfile(@Arg("userId") userId: string): Promise<User | undefined> {
    return User.findOne(userId);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async editProfile(
    @Arg("options") options: EditProfileInput,
    @Ctx() ctx: ContextType
  ): Promise<boolean> {
    if (options.password) {
      if (!options.old_password) throw new Error("OLD_PASSWORD_INCORRECT");
      if (options.password !== options.password_confirmation)
        throw new Error("PASSWORDS_DO_NOT_MATCH");

      let user = await User.createQueryBuilder("user")
        .select("user.password")
        .from(User, "user")
        .where("user.id = :id", { id: ctx.req.user.userId })
        .getOne();

      if (!user) throw new Error("INTERNAL_SERVER_ERROR");

      if (!(await argon2.verify(user.password, options.old_password)))
        throw new Error("OLD_PASSWORD_INCORRECT");

      options.password = await argon2.hash(options.password);
    }

    let imgname: string | null = null;

    if (options.image) {
      let img = await options.image;
      imgname = `${uuidv4()}_${img.filename}`;

      let stream = img.createReadStream();

      // TODO:  FIND A WAY TO FUCKING VALIDATE THE PICTURE TYPE
      //        I DON'T WANT SONS OF BITCHS UPLOADING REVERSE_SHELL.JPEG
      //        TO MY GOD DAMN SERVER.

      stream
        .pipe(
          createWriteStream(
            path.join(__dirname, `../../static/images/${imgname}`)
          )
        )
        .on("error", () => {
          throw new Error("IMAGE_UPLOAD_FAILED");
        });
    }

    try {
      delete options.old_password;
      delete options.password_confirmation;
      delete options.image;

      if (imgname)
        await User.update(ctx.req.user.userId, {
          ...options,
          picture_url: imgname,
        });
      else await User.update(ctx.req.user.userId, options);

      return true;
    } catch (e) {
      throw new Error("INTERNAL_SERVER_ERROR");
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteUser(
    @Arg("password") password: string,
    @Ctx() ctx: ContextType
  ): Promise<boolean> {
    let user = await ctx.conn
      .getRepository(User)
      .createQueryBuilder()
      .select("user.password")
      .from(User, "user")
      .where("user.id = :id", { id: ctx.req.user.userId })
      .getOne();

    if (!user) throw new Error("INTERNAL_SERVER_ERROR");

    if (!(await argon2.verify(user.password, password)))
      throw new Error("PASSWORD_INCORRECT");

    await User.delete(ctx.req.user.userId);
    await ctx.redis.pipeline().del(ctx.req.user.userId).exec();

    return true;
  }
}

export default UserResolver;
