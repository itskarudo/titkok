import { ObjectType, Field, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserGender {
  MALE = "male",
  FEMALE = "female",
}

export enum UserAttraction {
  MEN = "men",
  WOMEN = "women",
  BOTH = "both",
}

registerEnumType(UserGender, {
  name: "UserGender",
});

registerEnumType(UserAttraction, {
  name: "UserAttraction",
});

@ObjectType()
@Entity()
class User extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  date_of_birth: Date;

  @Field(() => UserGender, {
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Field(() => UserAttraction, {
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: UserAttraction,
    nullable: true,
  })
  attraction: UserAttraction;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default User;
