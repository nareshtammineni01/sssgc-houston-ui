-- Migration: Add guest_count to event_signups
-- Allows users to RSVP with the number of people attending

ALTER TABLE event_signups
  ADD COLUMN IF NOT EXISTS guest_count integer NOT NULL DEFAULT 1
  CHECK (guest_count >= 1 AND guest_count <= 10);

-- Update RLS: admins can view signups joined with profiles (for export)
-- Already handled by existing "Admins can view all signups" policy

COMMENT ON COLUMN event_signups.guest_count IS 'Number of people attending (1-10). Total headcount = SUM(guest_count) across confirmed signups.';
