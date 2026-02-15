import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectNote } from "../models/note.models.js";
import { projectNoteMembership } from "../models/notemember.model.js";
import { NotesPermissionsEnum } from "../utils/constants.js";
import { createObjectId } from "../utils/stringToObjectId.js";
import { projectValidator } from "../utils/validators/projectValidator.js";
import { notesValidator } from "../utils/validators/notesValidator.js";

// ================= CREATE NOTE =================
const createNote = asyncHandler(async (req, res) => {
  const projectId = createObjectId(req.params.projectId);
  const { title, content } = req.body;
  const userId = req.user._id;

  await projectValidator(projectId, userId);

  const note = await ProjectNote.create({
    project: projectId,
    title,
    content,
    createdBy: userId,
  });

  await projectNoteMembership.create({
    project: projectId,
    note: note._id,
    member: userId,
    permissionLevel: NotesPermissionsEnum.ADMIN,
    grantedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

// ================= GET ALL NOTES =================
const getNotes = asyncHandler(async (req, res) => {
  const projectId = createObjectId(req.params.projectId);
  const userId = req.user._id;

  await projectValidator(projectId, userId);

  const notes = await projectNoteMembership
    .find({
      project: projectId,
      member: userId,
    })
    .populate({
      path: "note",
      populate: {
        path: "createdBy",
        select: "_id username",
      },
    });

  return res.status(200).json(new ApiResponse(200, notes, "Fetched all notes"));
});

// ================= GET NOTE BY ID =================
const getNoteById = asyncHandler(async (req, res) => {
  const projectId = createObjectId(req.params.projectId);
  const noteId = createObjectId(req.params.noteId);
  const userId = req.user._id;

  await projectValidator(projectId, userId);

  const { note } = await notesValidator(projectId, noteId, userId);

  const populatedNote = await ProjectNote.findById(note._id)
    .select("_id title content createdBy createdAt updatedAt")
    .populate({
      path: "createdBy",
      select: "_id username",
    });

  return res
    .status(200)
    .json(new ApiResponse(200, populatedNote, "Fetched note"));
});

// ================= UPDATE NOTE =================
const updateNote = asyncHandler(async (req, res) => {
  const projectId = createObjectId(req.params.projectId);
  const noteId = createObjectId(req.params.noteId);
  const userId = req.user._id;
  const { title, content } = req.body;

  await projectValidator(projectId, userId);

  const { membership } = await notesValidator(projectId, noteId, userId);

  if (
    membership.permissionLevel !== NotesPermissionsEnum.WRITE &&
    membership.permissionLevel !== NotesPermissionsEnum.ADMIN
  ) {
    throw new ApiError(403, "You do not have permission to update this note");
  }

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    noteId,
    { title, content },
    { new: true },
  )
    .select("_id title content createdBy createdAt updatedAt")
    .populate({
      path: "createdBy",
      select: "_id username",
    });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

// ================= DELETE NOTE =================
const deleteNote = asyncHandler(async (req, res) => {
  const projectId = createObjectId(req.params.projectId);
  const noteId = createObjectId(req.params.noteId);
  const userId = req.user._id;

  await projectValidator(projectId, userId);

  const { membership } = await notesValidator(projectId, noteId, userId);

  if (membership.permissionLevel !== NotesPermissionsEnum.ADMIN) {
    throw new ApiError(403, "Only admin can delete this note");
  }

  await ProjectNote.findByIdAndDelete(noteId);

  await projectNoteMembership.deleteMany({
    note: noteId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});

export { createNote, getNotes, getNoteById, updateNote, deleteNote };
