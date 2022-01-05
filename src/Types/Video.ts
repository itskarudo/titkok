import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./User";

@ObjectType()
@Entity()
class Video extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  caption: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  video_url: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.videos)
  @JoinColumn()
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Video;
