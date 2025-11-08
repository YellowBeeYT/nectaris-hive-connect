-- Modifică structura tabelului land_listings pentru multiple imagini și preț pe zi
ALTER TABLE land_listings 
  RENAME COLUMN image_url TO image_urls;

ALTER TABLE land_listings 
  ALTER COLUMN image_urls TYPE text[] USING CASE 
    WHEN image_urls IS NULL THEN NULL 
    ELSE ARRAY[image_urls] 
  END;

ALTER TABLE land_listings 
  ALTER COLUMN image_urls SET DEFAULT '{}';

ALTER TABLE land_listings 
  RENAME COLUMN price_per_month TO price_per_day;

-- Actualizează comentariile coloanelor
COMMENT ON COLUMN land_listings.image_urls IS 'Array of image URLs for the listing';
COMMENT ON COLUMN land_listings.price_per_day IS 'Price per day in RON';