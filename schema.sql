DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(50),
  formatted_name VARCHAR(200),
  latitude decimal,
  longitude decimal
);