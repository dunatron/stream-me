import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./User";
import { Ref } from "../types/Ref";

@ObjectType({ description: "Stream embedded post content" })
export class Stream {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field({ description: "Stream's title" })
  @Property({ required: true })
  title: string;

  @Field({ description: "Stream's description" })
  @Property({ required: true })
  description: string;

  @Field({ description: "Stream's url" })
  @Property({ required: true })
  url: string;

  @Field(() => User, { description: "Stream's author" })
  @Property({ ref: User, required: true })
  author: Ref<User>;
}

export const StreamModel = getModelForClass(Stream);
