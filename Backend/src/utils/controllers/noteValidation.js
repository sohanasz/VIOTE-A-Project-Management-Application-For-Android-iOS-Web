import mongoose from "mongoose";
import { projectNoteMembership } from "../../models/notemember.model.js";
import { ApiError } from "../api-error.js";

export const notesValidator = async (
  projectId,
  noteId,
  userId,
  options = {},
) => {
  const { populate = [] } = options;

  const pipeline = [
    {
      $match: {
        project: projectId,
        note: noteId,
        member: userId,
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
  ];

  /**
   * Population map
   * Add new populate options here in the future
   */
  const populationMap = {
    createdBy: [
      {
        $lookup: {
          from: "users",
          localField: "note.createdBy",
          foreignField: "_id",
          as: "note.createdBy",
        },
      },
      {
        $unwind: {
          path: "$note.createdBy",
        },
      },
      {
        $addFields: {
          "note.createdBy": {
            _id: "$note.createdBy._id",
            username: "$note.createdBy.username",
          },
        },
      },
    ],

    // Future example:
    // project: [
    //   {
    //     $lookup: {
    //       from: "projects",
    //       localField: "project",
    //       foreignField: "_id",
    //       as: "project",
    //     },
    //   },
    //   { $unwind: "$project" },
    // ],
  };

  populate.forEach((field) => {
    if (populationMap[field]) {
      pipeline.push(...populationMap[field]);
    }
  });

  const result = await projectNoteMembership.aggregate(pipeline);

  if (!result.length || !result[0].note) {
    throw new ApiError(404, "Note not found or access denied");
  }

  return {
    note: result[0].note,
    membership: result[0],
  };
};
