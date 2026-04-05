-- Migration: Add rsvp_deadline to events
-- After this timestamp, RSVPs are frozen (no new signups, no changes, no cancellations)

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS rsvp_deadline timestamptz DEFAULT NULL;

COMMENT ON COLUMN events.rsvp_deadline IS 'Cut-off time for RSVPs. NULL = no deadline (open until event starts).';
