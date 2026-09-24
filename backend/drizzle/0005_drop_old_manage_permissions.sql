-- Anciens droits « manage » découpés en droits par action : on retire les restes.
DELETE FROM "role_permissions" WHERE "permission" IN ('roles.manage', 'users.manage');--> statement-breakpoint
UPDATE "users" SET "extra_permissions" = array_remove(array_remove("extra_permissions", 'roles.manage'), 'users.manage');
