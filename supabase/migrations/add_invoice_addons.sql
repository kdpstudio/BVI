-- Branded Invoices and Recurring Invoices add-ons.

ALTER TABLE users ADD COLUMN IF NOT EXISTS addon_branded_invoices boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS addon_recurring_invoices boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_logo_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_brand_color text DEFAULT '#00c8ff';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_addon_branded_sub_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_addon_recurring_sub_id text;

CREATE TABLE IF NOT EXISTS recurring_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_address text,
  from_name text,
  from_email text,
  from_address text,
  currency text NOT NULL DEFAULT 'GBP',
  vat_rate numeric NOT NULL DEFAULT 0,
  items jsonb NOT NULL,
  notes text,
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly')),
  next_run_date date NOT NULL,
  invoice_seq integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recurring invoices" ON recurring_invoices FOR ALL USING (auth.uid() = user_id);
