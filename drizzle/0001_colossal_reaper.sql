ALTER TABLE "departments" ALTER COLUMN "code" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "name" varchar(255) NOT NULL;