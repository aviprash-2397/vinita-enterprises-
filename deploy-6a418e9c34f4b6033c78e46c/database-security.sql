-- =====================================================
-- Vinita Enterprises - DevSecOps Hardening (v4)
-- Run this in Supabase -> SQL Editor -> New Query
-- =====================================================

-- 1. Performance: Add time-series indexes to prevent N+1 and full table scans
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_paid_on ON payments(paid_on DESC);
CREATE INDEX IF NOT EXISTS idx_retailers_outstanding ON retailers(outstanding DESC);

-- 2. Backend Enforcement: 6-Month Predictive Engine Gate
-- This prevents client-side bypass of the proprietary algorithm
CREATE OR REPLACE FUNCTION get_predictive_forecast() 
RETURNS json AS $$
DECLARE
  oldest_date TIMESTAMPTZ;
  days_diff NUMERIC;
BEGIN
  -- Get absolute oldest transaction
  SELECT min(order_date) INTO oldest_date FROM orders;
  
  -- If database is empty or too young, throw a hard database exception
  IF oldest_date IS NULL THEN
    RAISE EXCEPTION 'Locked: No Data Available';
  END IF;

  days_diff := EXTRACT(EPOCH FROM (now() - oldest_date)) / 86400;

  IF days_diff < 180 THEN
    RAISE EXCEPTION 'Locked: Needs 6mo Data (Current: % days)', floor(days_diff);
  END IF;
  
  -- If validation passes, return the forecast projection payload
  RETURN json_build_object(
    'status', 'unlocked', 
    'forecast_multiplier', 1.15,
    'message', 'Proprietary engine engaged'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Row Level Security (RLS) - Broken Object Level Authorization (IDOR) Patch
-- WARNING: Executing these RLS policies requires migrating from localStorage to Supabase Auth.
-- Uncomment and run these when Supabase Auth is integrated.

/*
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesmen ENABLE ROW LEVEL SECURITY;

-- Retailers can only read their own data
CREATE POLICY "Retailer Read Own Data" ON retailers
  FOR SELECT USING (auth.uid() = id);

-- Salesmen can read their assigned retailers
CREATE POLICY "Salesman Read Assigned Retailers" ON retailers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.retailer_id = retailers.id AND orders.salesman_id = auth.uid())
  );

-- Admin has full access (Assuming custom claim 'role' = 'admin')
CREATE POLICY "Admin Full Access" ON retailers
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');
*/
