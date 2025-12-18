-- 1. Borrar versiones anteriores
DROP FUNCTION IF EXISTS public.get_ancestors(uuid);
DROP FUNCTION IF EXISTS public.get_descendants(uuid);

-- 2. get_ancestors CON HASH
CREATE OR REPLACE FUNCTION public.get_ancestors(start_node_id uuid)
 RETURNS TABLE(id uuid, "parentId" uuid, name text, hash text, "isDir" boolean, depth integer)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE ancestors AS (
    -- Nivel 0
    SELECT "id", "parentId", "name", "hash", "isDir", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- Recursividad (Padres)
    SELECT n."id", n."parentId", n."name", n."hash", n."isDir", a.depth + 1
    FROM "node" n
    JOIN ancestors a ON n."id" = a."parentId"
  )
  SELECT "id", "parentId", "name", "hash", "isDir", depth
  FROM ancestors
  ORDER BY depth;
$function$;

-- 3. get_descendants CON HASH
CREATE OR REPLACE FUNCTION public.get_descendants(start_node_id uuid)
 RETURNS TABLE(id uuid, "parentId" uuid, name text, hash text, "isDir" boolean, depth integer)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE descendants AS (
    -- Nivel 0
    SELECT "id", "parentId", "name", "hash", "isDir", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- Recursividad (Hijos)
    SELECT n."id", n."parentId", n."name", n."hash", n."isDir", d.depth + 1
    FROM "node" n
    JOIN descendants d ON n."parentId" = d."id"
  )
  SELECT "id", "parentId", "name", "hash", "isDir", depth
  FROM descendants
  ORDER BY depth;
$function$;