import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType({ description: "User model" })
export class User {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field({ description: "User's email address" })
  @Property({ required: true })
  email: string;

  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
