import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { projectNoteMembership } from "../models/notemember.model.js";
import { NotesPermissionsEnum } from "../utils/constants.js";
import { createObjectId } from "../utils/stringToObjectId.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, content } = req.body;

  const project = await Project.findById(createObjectId(projectId));

  if (!project) {
    throw new ApiError(401, "No project found");
  }

  const note = await ProjectNote.create({
    project: createObjectId(projectId),
    title,
    content,
    createdBy: req.user._id,
  });

  await projectNoteMembership.create({
    project: createObjectId(projectId),
    createdBy: req.user._id,
    permissionLevel: NotesPermissionsEnum.ADMIN,
  });

  return res.status(200).json(new ApiResponse(200, note, "Notes Created!"));
});

const getNotes = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  const projectObjectId = createObjectId(projectId);

  const project = await Project.findById(projectObjectId);

  if (!project) {
    throw new ApiError(401, "No project found");
  }

  const isUserPartOfProject = await ProjectMember.findOne({
    project: projectObjectId,
    user: user._id,
  });

  if (!isUserPartOfProject) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const notes = await projectNoteMembership
    .find({
      project: projectObjectId,
      member: user._id,
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

const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const project = await Project.findById(createObjectId(projectId));

  if (!project) {
    throw new ApiError(401, "No project found");
  }

  const note = await ProjectNote.findById(createObjectId(noteId));

  if (!note) {
    throw new ApiError(401, "Note not found");
  }

  if (note.project.toString() !== createObjectId(projectId).toString()) {
    throw new ApiError(403, "Invalid access of note");
  }

  return res.status(200).json(new ApiResponse(200, note, "Fetched a note"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;

  const existingNote = await ProjectNote.findById(createObjectId(noteId));

  if (!existingNote) {
    throw new ApiError(401, "Note not found");
  }

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    createObjectId(noteId),
    { title, content },
    { new: true },
  ).populate("createdBy", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Updated Note"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findByIdAndDelete(createObjectId(noteId));

  if (!note) {
    throw new ApiError(401, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Successfully Deleted"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
