import { ObjectId } from "mongodb";

// Returns null for an invalid id, so routes can send 404.
export function toObjectId(id) {
  return typeof id === "string" &&
    ObjectId.isValid(id) &&
    /^[a-f0-9]{24}$/i.test(id)
    ? new ObjectId(id)
    : null;
}
