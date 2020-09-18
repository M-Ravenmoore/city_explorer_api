DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(50),
  formatted_query VARCHAR(50),
  latitude decimal,
  longitude decimal
);
DROP TABLE IF EXISTS weather;
CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  time VARCHAR(30),
  forecast VARCHAR(225),
  lat decimal,
  lon decimal
);