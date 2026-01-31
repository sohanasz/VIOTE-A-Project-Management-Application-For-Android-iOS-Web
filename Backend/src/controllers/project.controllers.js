import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { StatusEnum, UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.models.js";

const createProject = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Project name and description are required");
  }

  const project = await Project.create({
    name,
    description,
    createdBy: user._id,
  });

  const projectMember = await ProjectMember.create({
    user: user._id,
    project: project._id,
    role: UserRolesEnum.ADMIN,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        project,
        projectMember,
      },
      "Project successfully created",
    ),
  );
});

const getProjects = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const projectMemberships = await ProjectMember.find({
      user: userId,
      status: StatusEnum.ACTIVE,
    })
      .select({
        project: 1,
        role: 1,
      })
      .populate({
        path: "project",
        populate: {
          path: "createdBy",
          model: "User",
          select: "username",
        },
      });

    const projects = projectMemberships;

    return res
      .status(200)
      .json(new ApiResponse(200, projects, "Projects fetched"));
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: {},
      message: "Error fetching projects",
    });
  }
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!membership) {
    throw new ApiError(403, "Access denied to this project");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project details fetched"));
});

// UPDATE project (only by admin)
const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;
  const { name, description } = req.body;

  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!membership || membership.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(403, "Only project admins can update the project");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true },
  );
  return res.status(200).json(new ApiResponse(200, project, "Project updated"));
});

// DELETE project (only by admin)
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!membership || membership.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(403, "Only project admins can delete the project");
  }

  await Project.findByIdAndDelete(projectId);
  await ProjectMember.deleteMany({ project: projectId });
  await ProjectNote.deleteMany({ project: projectId });

  return res.status(200).json(new ApiResponse(200, null, "Project deleted"));
});

// GET project members
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!membership) {
    throw new ApiError(403, "Access denied to this project");
  }

  const members = await ProjectMember.find({ project: projectId }).populate(
    "user",
    "_id username fullname",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, members, "Project members fetched"));
});

const addMemberToProject = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.params;
    const { usernameToAdd, role } = req.body;

    if (!userId || !projectId || !usernameToAdd || !role) {
      throw new ApiError(401, "Invalid Operation");
    }

    const requester = await ProjectMember.findOne({
      user: userId,
      project: projectId,
    });

    if (
      !requester ||
      (requester.role !== UserRolesEnum.ADMIN &&
        requester.role !== UserRolesEnum.PROJECT_ADMIN)
    ) {
      throw new ApiError(403, "Only authorized can add members");
    }

    const userToAdd = await User.findOne({
      username: usernameToAdd,
    });

    if (!userToAdd) {
      throw new ApiError(
        401,
        `User does not exist with username: ${usernameToAdd}`,
      );
    }

    const existing = await ProjectMember.findOne({
      user: userToAdd._id,
      project: projectId,
    });

    if (existing && existing.status === StatusEnum.ACTIVE) {
      throw new ApiError(
        400,
        `User is already a member of the project: ${usernameToAdd}`,
      );
    }

    let newMember = null;
    if (!existing) {
      newMember = await ProjectMember.create({
        user: new mongoose.Types.ObjectId(userToAdd._id),
        project: projectId,
        role: role || UserRolesEnum.MEMBER,
      });
    } else if (existing.status === StatusEnum.REMOVED) {
      existing.status = StatusEnum.ACTIVE;
      newMember = await existing.save();
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newMember, "Member added successfully"));
  } catch (error) {
    return res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const userId = req.user._id;

  const requester = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!requester || requester.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(403, "Only admins can remove members");
  }

  const membership = await ProjectMember.findOneAndUpdate(
    { user: memberId, project: projectId, status: StatusEnum.ACTIVE },
    { status: StatusEnum.REMOVED },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Member removed from project"));
});

// UPDATE membership role (only by admin)
const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;
  const userId = req.user._id;

  const requester = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (!requester || requester.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(403, "Only admins can update roles");
  }

  const updatedMember = await ProjectMember.findOneAndUpdate(
    { user: memberId, project: projectId, status: StatusEnum.ACTIVE },
    { role },
    { new: true },
  );

  if (!updatedMember) {
    throw new ApiError(
      401,
      "Member not found, please add one before assigning role to non existing member",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMember, "Member role updated"));
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
