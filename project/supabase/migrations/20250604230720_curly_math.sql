/*
  # Update authentication settings and remove default admin

  1. Changes
    - Remove default admin user
    - Update authentication settings using functions
    - Ensure changes are applied outside transaction blocks
*/

-- Create function to handle system settings
CREATE OR REPLACE FUNCTION update_auth_settings()
RETURNS void AS $$
BEGIN
  -- Remove default admin user
  DELETE FROM auth.users WHERE email = 'admin@example.com';
  
  -- Update auth settings
  PERFORM set_config('app.settings.auth.email.enable_signup', 'true', false);
  PERFORM set_config('app.settings.auth.email.mailer_autoconfirm', 'false', false);
  PERFORM set_config('app.settings.auth.email.site_url', 'https://your-live-site.com', false);
  PERFORM set_config('app.settings.auth.email.smtp_admin_email', 'noreply@your-live-site.com', false);
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT update_auth_settings();