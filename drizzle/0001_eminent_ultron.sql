CREATE TABLE "daily_problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_problems_date_unique" UNIQUE("date")
);
--> statement-breakpoint
ALTER TABLE "device" DROP CONSTRAINT "device_fingerprint_unique";--> statement-breakpoint
ALTER TABLE "problems" DROP CONSTRAINT "problems_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_problem_id_problems_id_fk";
--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "is_hidden" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_fingerprint_user_id_pk" PRIMARY KEY("fingerprint","user_id");--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "driver_code" jsonb;--> statement-breakpoint
ALTER TABLE "daily_problems" ADD CONSTRAINT "daily_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "problems_collection_id_idx" ON "problems" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "problems_created_by_idx" ON "problems" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "problems_slug_idx" ON "problems" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "test_cases_problem_id_idx" ON "test_cases" USING btree ("problem_id");--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_slug_unique" UNIQUE("slug");