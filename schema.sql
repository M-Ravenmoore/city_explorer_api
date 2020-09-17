DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(50),
  formatted_name VARCHAR(200),
  latitude decimal,
  longitude decimal
);

INSERT INTO locations (
  city_name,
  latitude,
  longitude
)
VALUES (
  'seattle',
  42,
  -123
);