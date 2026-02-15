import { Project } from "../../models/project.models.js";
import { ProjectMember } from "../../models/projectmember.models.js";
import { ApiError } from "../api-error.js";

export const projectValidator = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  return { project, membership };
};
