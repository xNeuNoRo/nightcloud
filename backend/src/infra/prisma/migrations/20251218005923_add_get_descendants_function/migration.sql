CREATE OR REPLACE FUNCTION get_descendants(start_node_id UUID)
RETURNS TABLE (
  "id" UUID,
  "parentId" UUID,
  depth INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE descendants AS (
    -- nivel 0: nodo inicial
    SELECT "id", "parentId", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- bajar en la jerarquía
    SELECT n."id", n."parentId", d.depth + 1
    FROM "node" n
    JOIN descendants d ON n."parentId" = d."id"
  )
  SELECT "id", "parentId", depth
  FROM descendants
  ORDER BY depth;
$$;
