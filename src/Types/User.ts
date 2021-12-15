import {ObjectType, Field} from "type-graphql";
import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";

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

  @Field()
  @Column()
  password: string;

  @Field()
  @Column()
  admin: boolean;

  @Column()
  token_version: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

}

export default User;
