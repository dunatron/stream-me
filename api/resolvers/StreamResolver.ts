import {
  Resolver,
  Mutation,
  Query,
  FieldResolver,
  Ctx,
  Arg,
  Root,
  UseMiddleware,
} from "type-graphql";

import { ObjectId } from "mongodb";
import { MyContext } from "types/MyContext";
import { User, UserModel } from "entity/User";
import { ObjectIdScalar } from "schema/object-id.scalar";
import { StreamInput } from "types/StreamInput";
import { isAuth } from "middleware/isAuth";
import { Stream, StreamModel } from "entity/Stream";

@Resolver(() => Stream)
export class StreamResolver {
  @Query(() => Stream, { nullable: true })
  stream(@Arg("streamId", () => ObjectIdScalar) streamId: ObjectId) {
    return StreamModel.findById(streamId);
  }

  @Query(() => [Stream])
  @UseMiddleware(isAuth)
  streams(@Ctx() ctx: MyContext) {
    return StreamModel.find({ author: ctx.res.locals.userId });
  }

  @Mutation(() => Stream)
  @UseMiddleware(isAuth)
  async addStream(
    @Arg("input") input: StreamInput,
    @Ctx() ctx: MyContext
  ): Promise<Stream> {
    const stream = new StreamModel({
      ...input,
      author: ctx.res.locals.userId,
    } as Stream);
    await stream.save();
    return stream;
  }

  @Mutation(() => Stream)
  @UseMiddleware(isAuth)
  async editStream(
    @Arg("input") input: StreamInput,
    @Ctx() ctx: MyContext
  ): Promise<Stream> {
    const { id, title, description, url } = input;
    const stream = await StreamModel.findOneAndUpdate(
      {
        _id: id,
        author: ctx.res.locals.userId,
      },
      { title, description, url },
      { new: true, runValidators: true }
    );
    if (!stream) {
      throw new Error("Stream not found");
    }
    return stream;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteStream(
    @Arg("streamId", () => ObjectIdScalar) streamId: ObjectId,
    @Ctx() ctx: MyContext
  ): Promise<boolean | undefined> {
    const deleted = await StreamModel.findOneAndDelete({
      _id: streamId,
      author: ctx.res.locals.userId,
    });
    if (!deleted) {
      throw new Error("Stream not found");
    }
    return true;
  }

  @FieldResolver()
  async author(@Root() stream: Stream): Promise<User | null> {
    return await UserModel.findById(stream.author);
  }
}
