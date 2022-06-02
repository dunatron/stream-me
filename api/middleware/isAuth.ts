import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/MyContext";
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
