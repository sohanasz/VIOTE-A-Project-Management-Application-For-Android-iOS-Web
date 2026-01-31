import mongoose, { Schema } from "mongoose";

const blockSchema = new Schema(
  {
    id: Number,

    blockType: {
      type: String,
      enum: ["heading", "paragraph", "bulletList", "numericList"],
      required: true,
    },

    isFocused: {
      type: Boolean,
      default: false,
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },

    textInputHeight: {
      type: Number,
      default: 100,
    },

    text: {
      type: Schema.Types.Mixed,
      required: true,
    },

    currentBulletPointId: {
      type: Number,
      default: null,
    },
  },
  { _id: false },
);

const projectNoteSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: [blockSchema],
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
