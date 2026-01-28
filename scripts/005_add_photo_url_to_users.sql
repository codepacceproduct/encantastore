-- Add photo_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update the existing kelyson user with empty photo_url
UPDATE users SET photo_url = '' WHERE username = 'kelyson';
