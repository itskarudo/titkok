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

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio: string;

  @Column()
  password: string;

  @Field({nullable: true})
  @Column({nullable: true})
  date_of_birth: Date;

  @Field({nullable: true})
  @Column({nullable: true})
  gender: string;

  @Field({nullable: true})
  @Column({nullable: true})
  sexuality: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

}

export default User;
