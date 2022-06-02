## API Setup

create a new `tsconfig.json` file and copy the below contents

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "lib": ["dom", "es6", "es2017", "ESNext.AsyncIterable"],
    "sourceMap": true,
    "outDir": "./dist",
    "moduleResolution": "node",
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "./generated"]
}
```

## Entities

We will create our first entity called User. create a new folder and file  
`api/entity/User.ts`

```ts
import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  email: string;

  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
```

`@Field()` only gets declared on fields we want to be readable. notice it is not on the password field

`@Property()` allows a property to have write access which allows us to write those properties for each user

`export const UserModel = getModelForClass(User)` we export the User class with getModelForClass so that we have the ability to call mogodb and mongoose methods on the user model

## Decorators

Lets talk about some of the @decorators we use and why.  
These decorators help us write short hand classes that can be used in a broader scope with our GraphQL interface. e.g `@ObjectType()` allows us to mark this as a type known from the graphql schema definition language.  
We use the `@Field()` decorator to define which fields are accessible by our schema  
[TypeGraphQL types and fields Docs](https://typegraphql.com/docs/types-and-fields.html)

## Ref Type

Now we will create our first ref type which will allow us to reference one database object from another in mongodb

this ref type is considered to be a manual reference where you save the objectId field of one Document and another document as a reference. Once we save this manual reference our application can run a second query to return any related data e.g one user has many different streams

create a new types folder and a new file called Ref.ts  
`api/tpes/Ref.ts`

```ts
import { ObjectId } from "mongodb";
export type Ref<T> = T | ObjectId;
```

nearly every use case where we want to store a relationship between two documents we will use a manual reference like this. But in some cases we may want to create a more complex relational database ereference which will allow you to reference documents from multiple collections, where you would use a database reference. Here we will rely on manual references. But if you want more complex relationships between database nodes you may want to consider using database references at that point

## Stream Entity

in our application streams are considered to be embedded posts. so within the stream entity we are going to reference the user entity with our ref type and assign them as the streams author.

Create a new entiy file called Stream  
`api/entity/Stream.ts`

```ts
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
```

With our User and Stream Entities defined we can now define a GraphQL scalar for our GraphQL schema  
The scalar will allow us to reference these object ids in the context of our mongodb application and in order to refernce object ids in graphql we will create an objectId scalar

## ObjectId Scalar

This will take objectId from Mongodb and pasre it as a string.  
Go ahead and create a new folder called schema and a file called object-id.scalar.ts  
`api/schema/object-id.scalar.ts`

```ts
import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";

export const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "MongoDB ObjectId scalar type",
  parseValue(value: string) {
    return new ObjectId(value); // client input variable
  },
  serialize(value: ObjectId) {
    return value.toHexString(); // objectId to string, value sent to the client
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // ast value is always in string format
    }
    return null;
  },
});
```

## MyContext Middleware

Go and create a new file in the types folder called MyContext.ts  
`api/types/MyContext.ts`

```ts
import { Request, Response } from "express";

export interface MyContext {
  req: Request;
  res: Response;
}
```

So now we will be able to read a custom context anytime we pass in the custom context to a GraphQL resolver.  
Next we will create a custom middleware which will check the authenticated user

## isAuth Middleware

create a new file called isAuth in a new folder called middleware  
`api/middleware/isAuth.ts`

```ts
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import jwt from "jsonwebtoken";

const APP_SECRET = process.env.APP_SECRET || "mysecret";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("not authenticated");
  }

  try {
    const token = authorization?.replace("Bearer ", "");
    const user = jwt.verify(token!, APP_SECRET) as any;
    context.res.locals.userid = user.id;
    return next();
  } catch (e) {
    console.log(e);
    throw new Error("not authenticated to resolver");
  }
};
```

## Typegoose Middleware

we need another middleware for typegoose which will allow us to convert typegoose documents into object models. The purpose of the typegoose middleware is to take care of converting the document model object into plain javascript objects which we can read from our database

create a new file in the middleware folder called typegoose.ts  
`api/middleware/typegoose.ts`

```ts
import { Model, Document } from "mongoose";
import { getClassForDocument } from "@typegoose/typegoose";
import { MiddlewareFn } from "type-graphql";

export const TypegooseMiddleware: MiddlewareFn = async (_, next) => {
  const result = await next();
  if (Array.isArray(result)) {
    return result.map((item) =>
      item instanceof Model ? convertDocument(item) : item
    );
  }
  if (result instanceof Model) {
    return convertDocument(result);
  }
  return result;
};

function convertDocument(document: Document) {
  const convertDocument = document.toObject();
  const DocumentClass = getClassForDocument(document);
  Object.setPrototypeOf(convertDocument, DocumentClass?.prototype);
  return convertDocument;
}
```

## User Resolver

This resolver will handle any queries realted to fetching user data  
create a new folder called resolvers and in there create a new file called UserResolver.ts  
`api/resolvers/UserResolver.ts`

```ts
import { Resolver, Query, UseMiddleware, Arg, Ctx } from "type-graphql";
import { ObjectId } from "mongodb";
import { MyContext } from "types/MyContext";
import { isAuth } from "middleware/isAuth";
import { User, UserModel } from "entity/User";
import { ObjectIdScalar } from "schema/object-id.scalar";

@Resolver(() => User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Arg("userId", () => ObjectIdScalar) userId: ObjectId) {
    return await UserModel.findById(userId);
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() ctx: MyContext): Promise<User | null> {
    const userId = ctx.res.locals.userId;
    if (!userId) {
      return null;
    }
    return await UserModel.findById(userId);
  }
}
```

## Typegoose Introduction

A quick overview of the tech we are using.  
`MongoDB`: is our database  
`Mongoose`: is our database driver  
`Typescript`: typescript is our chosen language to develop in  
`GraphQL/Schema`: we are building a graphql api  
`TypeGraphQL`: is a convienient wrapper around typescript and graphql  
`Typegoose`: finally combining Mongoose and TypeGraphQL we were able to choose typegoose which is a handy wrapper around typescript models that are written for mongoose

## AuthInput

create a new file under types called AuthInput  
`api/types/AuthInput.ts`

```ts
import { InputType, Field } from "type-graphql";

@InputType()
export class AuthInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
```

Then create a new filed in the types folder called UserResponse  
`api/types/UserResponse.ts`

```ts
import { ObjectType, Field } from "type-graphql";
import { User } from "entity/User";

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;
}
```

## Register Mutation

install a new module under the api folder
`npm install bcryptjs`  
`npm install -D @types/bcryptjs`  
next create a new file under the resolvers folder called AuthResolver  
`api/resolvers/AuthResolver.ts`

```ts
import { Arg, Mutation, Resolver } from "type-graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { UserModel } from "entity/User";
import { AuthInput } from "types/AuthInput";
import { UserResponse } from "types/UserResponse";

@Resolver()
export class AuthResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("input") { email, password }: AuthInput
  ): Promise<UserResponse> {
    // 1. check for an existing email address
    const existingUser = await UserModel.findOne({ where: { email } });

    if (existingUser) {
      throw new Error("Email already in use");
    }
    // 2. create a new user with a hashed password
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      email,
      password: hashedPassword,
    });
    await user.save();

    // 3. store user id on the token payload
    const payload = {
      id: user.id,
    };
    const token = jwt.sign(payload, process.env.SESSION_SECRET || "secret");

    return { user, token };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input") { email, password }: AuthInput
  ): Promise<UserResponse> {
    // 1. check for an existing email address
    const existingUser = await UserModel.findOne({ where: { email } });

    if (!existingUser) {
      throw new Error("No User exists with that email");
    }

    // check of password is valid
    const valid = await bcrypt.compare(password, existingUser.password);

    if (!valid) {
      throw new Error("Invalid Password");
    }

    // 3. store user id on the token payload
    const payload = {
      id: existingUser.id,
    };
    const token = jwt.sign(payload, process.env.SESSION_SECRET || "secret");

    return { user: existingUser, token };
  }
}
```

## Stream Input

create a new file called StreamInput.ts under the types folder  
`api/types/StreamInput.ts`

```ts
import { InputType, Field } from "type-graphql";
import { ObjectId } from "mongodb";

import { Stream } from "../entity/Stream";

@InputType()
export class StreamInput implements Partial<Stream> {
  @Field({ nullable: true })
  id?: ObjectId;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  url: string;
}
```

## Stream Resolver

create a new file called StreamResolver.ts under the resolvers folder  
`api/resolvers/StreamResolver.ts`

```ts
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
```
