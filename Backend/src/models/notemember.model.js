import mongoose, { Schema } from "mongoose";

import { AvailableNotesPermissions } from "../utils/constants.js";

const getNotePermission = async (noteId, userId) => {
  return await projectNoteMembership.findOne({
    note: createObjectId(noteId),
    member: userId,
  });
};

const projectNoteMembershipSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "ProjectNote",
    required: true,
  },
  member: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  permissionLevel: {
    type: String,
    enum: AvailableNotesPermissions,
    required: true,
  },
  grantedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const projectNoteMembership = mongoose.model(
  "projectNoteMembership",
  projectNoteMembershipSchema,
);
