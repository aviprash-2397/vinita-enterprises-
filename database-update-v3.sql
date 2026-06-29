-- database-update-v3.sql

-- Feature: GPS Tracking for Salesmen
-- This table stores the latest known location for each salesman.
CREATE TABLE IF NOT EXISTS salesman_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesman_id UUID NOT NULL REFERENCES salesmen(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(8,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesman_id)
);

CREATE INDEX IF NOT EXISTS idx_salesman_locations_updated 
  ON salesman_locations(updated_at DESC);

-- Feature: Updates and Schemes
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
