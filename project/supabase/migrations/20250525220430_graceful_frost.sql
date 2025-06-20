/*
  # Update properties table with additional fields

  1. Changes
    - Add new columns to properties table:
      - bedrooms (integer)
      - bathrooms (numeric)
      - size (numeric)
      - amenities (text array)
      - type (text)
      - year_built (integer)

  2. Security
    
    - Maintain existing RLS policies
*/

-- Add new columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS bedrooms integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS bathrooms numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS size numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS type text DEFAULT 'apartment',
ADD COLUMN IF NOT EXISTS year_built integer DEFAULT extract(year from current_date);

-- Add constraints
ALTER TABLE properties
ADD CONSTRAINT properties_bedrooms_check CHECK (bedrooms >= 0),
ADD CONSTRAINT properties_bathrooms_check CHECK (bathrooms >= 0),
ADD CONSTRAINT properties_size_check CHECK (size >= 0),
ADD CONSTRAINT properties_year_built_check CHECK (year_built >= 1800);