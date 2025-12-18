CREATE OR REPLACE FUNCTION get_ancestors(start_node_id UUID)
RETURNS TABLE (
  "id" UUID,
  "parentId" UUID,
  depth INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE ancestors AS (
    -- nivel 0: nodo inicial
    SELECT "id", "parentId", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- subir en la jerarquia
    SELECT n."id", n."parentId", a.depth + 1
    FROM "node" n
    JOIN ancestors a ON n."id" = a."parentId"
  )
  SELECT "id", "parentId", depth
  FROM ancestors
  ORDER BY depth;
$$;
