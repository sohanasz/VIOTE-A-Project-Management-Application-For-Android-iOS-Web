import mongoose from "mongoose";

export const createObjectId = (id) =>
  mongoose.Types.ObjectId.createFromHexString(id);
