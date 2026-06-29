-- =====================================================
-- Vinita Enterprises — Database Update v2
-- Run this in Supabase → SQL Editor → New Query → Run
-- It's safe to run multiple times (uses IF NOT EXISTS).
-- =====================================================

-- 1. Retailer credit limits & outstanding (from v1)
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2);
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS outstanding DECIMAL(12,2) DEFAULT 0;

-- 2. Product schemes (from v1)
ALTER TABLE products ADD COLUMN IF NOT EXISTS scheme_buy INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS scheme_free INTEGER;

-- 3. Order status workflow (from v1)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'confirmed';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'dispatched';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- 5. Salesman login passwords
-- Passwords are set/reset from Admin -> Manage -> Salesmen in the app.
ALTER TABLE salesmen ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- =====================================================
-- NEW IN v2: Field-collected payments / receipts
-- =====================================================
-- Each row = one payment a salesman collected from a retailer.
-- Independent of orders (a payment can settle multiple bills, or be part-payment).
-- Pattern: same as Distributo / Marg / PaperDRS field collections.

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  salesman_id UUID NOT NULL REFERENCES salesmen(id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  mode TEXT NOT NULL CHECK (mode IN ('cash','upi','cheque','bank_transfer','other')),
  reference TEXT,                  -- UPI ref no / cheque no / bank txn id
  notes TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,   -- admin can mark as cleared/verified
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_retailer ON collections(retailer_id);
CREATE INDEX IF NOT EXISTS idx_collections_salesman ON collections(salesman_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collected_at DESC);

-- Trigger: when a collection is inserted, reduce retailer's outstanding by that amount.
-- When a collection is deleted, add it back. When updated, adjust the delta.
CREATE OR REPLACE FUNCTION update_retailer_outstanding_on_collection()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE retailers SET outstanding = COALESCE(outstanding,0) - NEW.amount WHERE id = NEW.retailer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE retailers SET outstanding = COALESCE(outstanding,0) + OLD.amount WHERE id = OLD.retailer_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- if amount or retailer changed, undo old and apply new
    UPDATE retailers SET outstanding = COALESCE(outstanding,0) + OLD.amount WHERE id = OLD.retailer_id;
    UPDATE retailers SET outstanding = COALESCE(outstanding,0) - NEW.amount WHERE id = NEW.retailer_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_collection_outstanding ON collections;
CREATE TRIGGER trg_collection_outstanding
AFTER INSERT OR UPDATE OR DELETE ON collections
FOR EACH ROW EXECUTE FUNCTION update_retailer_outstanding_on_collection();

-- Done. ✅
