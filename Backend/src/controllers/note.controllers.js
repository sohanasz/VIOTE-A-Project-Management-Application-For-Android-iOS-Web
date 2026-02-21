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

  const session = await mongoose.startSession();

  const note = await ProjectNote.create({
    project: projectId,
    title,
    content,
    createdBy: userId,
    lastUpdatedBy: userId,
  }).session(session);

  await projectNoteMembership
    .create({
      project: projectId,
      note: note._id,
      member: userId,
      permissionLevel: NotesPermissionsEnum.ADMIN,
      grantedBy: userId,
    })
    .session(session);

  await session.commitTransaction();
  session.endSession();

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

  const { note } = await notesValidator(
    projectId,
    noteId,
    userId,
    (populate = ["createdBy"]),
  );

  const populatedNote = note;

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

  const updatedNote = await ProjectNote.findOneAndUpdate(
    { _id: noteId, project: projectId, __v: req.body.__v },
    {
      $set: { title: title, content: content, lastUpdatedBy: userId },
      $inc: { __v: 1 },
    },
    { new: true },
  )
    .select("_id title content createdBy createdAt updatedAt")
    .populate({
      path: "createdBy",
      select: "_id username",
    });

  if (!updatedNote) {
    const recentUpdatedNote = await ProjectNote.findById(noteId)
      .select("_id title content createdBy createdAt updatedAt lastUpdatedBy")
      .populate({ path: "lastUpdatedBy", select: "_id username" });

    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          recentUpdatedNote,
          `Conflict detected. Recently note was updated by other user ${recentUpdatedNote.lastUpdatedBy.username}. Please refresh and try again.`,
        ),
      );
  }

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
    throw new ApiError(403, "Only note admin can delete this note");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  await ProjectNote.findByIdAndDelete(noteId).session(session);

  await projectNoteMembership
    .deleteMany({
      note: noteId,
    })
    .session(session);

  await session.commitTransaction();
  session.endSession();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});

export { createNote, getNotes, getNoteById, updateNote, deleteNote };
