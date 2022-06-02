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
