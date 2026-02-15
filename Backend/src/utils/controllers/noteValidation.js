import { ProjectNote } from "../../models/note.models.js";
import { projectNoteMembership } from "../../models/notemember.model.js";
import { ApiError } from "../api-error.js";

export const notesValidator = async (projectId, noteId, userId) => {
  const note = await ProjectNote.findOne({
    _id: noteId,
    project: projectId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  const membership = await projectNoteMembership.findOne({
    project: projectId,
    note: noteId,
    member: userId,
  });

  if (!membership) {
    throw new ApiError(403, "You do not have access to this note");
  }

  return { note, membership };
};
