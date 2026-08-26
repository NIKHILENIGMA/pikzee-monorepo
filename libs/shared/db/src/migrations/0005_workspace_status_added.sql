CREATE TYPE "public"."workspace_status" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "status" "workspace_status" DEFAULT 'ACTIVE' NOT NULL;