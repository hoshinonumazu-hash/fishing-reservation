-- Add start/end time columns with defaults to allow applying on existing rows
ALTER TABLE "fishing_plans" 
  ADD COLUMN IF NOT EXISTS "startTime" TEXT NOT NULL DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS "endTime"   TEXT NOT NULL DEFAULT '12:00';
