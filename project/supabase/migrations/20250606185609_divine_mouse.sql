/*
  # Add homepage background image setting

  1. Changes
    - Add homepage background image setting to settings table
    - Set default background image URL

  2. Security
    - Maintain existing RLS policies for settings table
*/

-- Insert default homepage background setting
INSERT INTO settings (key, value) VALUES
  ('homepage_background', '{"image_url": "https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg"}'::jsonb)
ON CONFLICT (key) DO NOTHING;