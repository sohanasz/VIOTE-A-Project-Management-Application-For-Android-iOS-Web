export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const StatusEnum = {
  ACTIVE: "active",
  REMOVED: "removed",
};

export const AvailableStatuses = Object.values(StatusEnum);

export const NotesPermissionsEnum = {
  READ: "read",
  WRITE: "write",
  ADMIN: "admin",
};

export const AvailableNotesPermissions = Object.values(NotesPermissionsEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);
