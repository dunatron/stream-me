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
