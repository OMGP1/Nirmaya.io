-- Migration: Add Voice Triage Context Briefs
-- Run this in your Supabase SQL Editor for project: efkdibdqjqoqnsrcixrw

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS context_brief TEXT;
