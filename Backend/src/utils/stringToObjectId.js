import mongoose from "mongoose";

export const createObjectId = (id, controllerName) => {
  if (!id) {
    throw new ApiError(400, "Id is required for this operation ");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid id while parsing: ${id}`);
  }

  return mongoose.Types.ObjectId.createFromHexString(id);
};
