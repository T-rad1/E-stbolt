-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can modify settings"
  ON settings FOR ALL
  TO authenticated
  USING (auth.jwt()->'user_metadata'->>'role' = 'admin')
  WITH CHECK (auth.jwt()->'user_metadata'->>'role' = 'admin');

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('site_info', '{"title": "HomeVista", "description": "Find your dream home with our AI-powered apartment marketplace."}'::jsonb),
  ('contact_info', '{"admin_email": "admin@example.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;