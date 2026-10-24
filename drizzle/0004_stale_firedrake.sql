CREATE TABLE "dictation_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"description" varchar(500),
	"grid_size" integer DEFAULT 7 NOT NULL,
	"start_x" integer DEFAULT 0 NOT NULL,
	"start_y" integer DEFAULT 0 NOT NULL,
	"commands" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
