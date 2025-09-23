-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "institution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "case_notes" TEXT NOT NULL,
    "total_score" INTEGER NOT NULL,
    "history_physical_score" INTEGER NOT NULL,
    "history_physical_feedback" TEXT NOT NULL,
    "differential_score" INTEGER NOT NULL,
    "differential_feedback" TEXT NOT NULL,
    "assessment_plan_score" INTEGER NOT NULL,
    "assessment_plan_feedback" TEXT NOT NULL,
    "followup_score" INTEGER NOT NULL,
    "followup_feedback" TEXT NOT NULL,
    "ai_model_used" TEXT NOT NULL,
    "processing_time" DOUBLE PRECISION NOT NULL,
    "token_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "cases_user_id_idx" ON "public"."cases"("user_id");

-- CreateIndex
CREATE INDEX "cases_created_at_idx" ON "public"."cases"("created_at");

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
