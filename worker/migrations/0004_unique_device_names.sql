UPDATE activations AS a SET device_name = (
  WITH RECURSIVE suffix(n) AS (
    SELECT 0 UNION ALL SELECT n + 1 FROM suffix
    WHERE n < (SELECT count(*) FROM activations WHERE license_id = a.license_id)
  )
  SELECT CASE WHEN n = 0 THEN substr(CASE WHEN trim(a.device_name) = '' THEN 'Computer' ELSE trim(a.device_name) END, 1, 128) ELSE substr(CASE WHEN trim(a.device_name) = '' THEN 'Computer' ELSE trim(a.device_name) END, 1, 128 - length(' (' || n || ')')) || ' (' || n || ')' END FROM suffix
  WHERE NOT EXISTS (
    SELECT 1 FROM activations AS other
    WHERE other.license_id = a.license_id AND other.device_id != a.device_id
      AND other.device_name = (CASE WHEN n = 0 THEN substr(CASE WHEN trim(a.device_name) = '' THEN 'Computer' ELSE trim(a.device_name) END, 1, 128) ELSE substr(CASE WHEN trim(a.device_name) = '' THEN 'Computer' ELSE trim(a.device_name) END, 1, 128 - length(' (' || n || ')')) || ' (' || n || ')' END) COLLATE NOCASE
  )
  ORDER BY n LIMIT 1
)
WHERE trim(a.device_name) = '' OR EXISTS (
  SELECT 1 FROM activations AS other
  WHERE other.license_id = a.license_id AND other.device_id != a.device_id
    AND other.device_name = a.device_name COLLATE NOCASE
    AND (other.activated_at < a.activated_at OR
      (other.activated_at = a.activated_at AND other.device_id < a.device_id))
);
CREATE UNIQUE INDEX activations_unique_name ON activations(license_id, device_name COLLATE NOCASE);
