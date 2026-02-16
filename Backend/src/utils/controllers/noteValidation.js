import { ProjectNote } from "../../models/note.models.js";
import { projectNoteMembership } from "../../models/notemember.model.js";
import { ApiError } from "../api-error.js";

export const notesValidator = async (projectId, noteId, userId) => {
  const result = await projectNoteMembership.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        note: new mongoose.Types.ObjectId(noteId),
        member: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "projectnotes",
        localField: "note",
        foreignField: "_id",
        as: "note",
      },
    },
    {
      $unwind: "$note",
    },
  ]);

  if (!result.length || !result[0].note) {
    throw new ApiError(404, "Note not found or access denied");
  }

  return { note: result[0].note, membership: result[0] };
};
