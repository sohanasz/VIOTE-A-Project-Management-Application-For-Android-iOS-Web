import { ProjectMember } from "../../models/projectmember.models.js";
import { ApiError } from "../api-error.js";

export const projectValidator = async (projectId, userId) => {
  const result = await ProjectMember.aggregate([
    {
      $match: {
        project: projectId,
        user: userId,
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
      },
    },
    {
      $unwind: "$project",
    },
  ]);

  if (!result.length || !result[0].project) {
    throw new ApiError(403, "Project not found or access denied");
  }

  return { project: result[0].project, membership: result[0] };
};
