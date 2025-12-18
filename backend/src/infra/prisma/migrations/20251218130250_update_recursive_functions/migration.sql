-- Borrar las versiones anteriores de las funciones
DROP FUNCTION IF EXISTS public.get_ancestors(uuid);
DROP FUNCTION IF EXISTS public.get_descendants(uuid);

-- Actualizar get_ancestors (Para calcular rutas relativas)
CREATE OR REPLACE FUNCTION public.get_ancestors(start_node_id uuid)
 RETURNS TABLE(id uuid, "parentId" uuid, name text, "isDir" boolean, depth integer)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE ancestors AS (
    -- Nivel 0: nodo inicial
    SELECT "id", "parentId", "name", "isDir", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- Subir en la jerarquía (padres)
    SELECT n."id", n."parentId", n."name", n."isDir", a.depth + 1
    FROM "node" n
    JOIN ancestors a ON n."id" = a."parentId"
  )
  SELECT "id", "parentId", "name", "isDir", depth
  FROM ancestors
  ORDER BY depth;
$function$;

-- Actualizar get_descendants (Para obtener todos los archivos de la carpeta)
CREATE OR REPLACE FUNCTION public.get_descendants(start_node_id uuid)
 RETURNS TABLE(id uuid, "parentId" uuid, name text, "isDir" boolean, depth integer)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE descendants AS (
    -- Nivel 0: nodo inicial
    SELECT "id", "parentId", "name", "isDir", 0 AS depth
    FROM "node"
    WHERE "id" = start_node_id

    UNION ALL

    -- Bajar en la jerarquía (hijos)
    SELECT n."id", n."parentId", n."name", n."isDir", d.depth + 1
    FROM "node" n
    JOIN descendants d ON n."parentId" = d."id"
  )
  SELECT "id", "parentId", "name", "isDir", depth
  FROM descendants
  ORDER BY depth;
$function$;