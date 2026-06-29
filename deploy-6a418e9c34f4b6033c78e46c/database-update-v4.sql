-- Update 4: Cross-Salesman Delivery Tracking

-- Add delivered_by column to orders table to track which salesman delivered the order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES salesmen(id);

-- Optional: If you want to enable Row Level Security (RLS) policies for delivered_by, you can add them here.
-- Currently, we rely on the application logic for this tracking.
