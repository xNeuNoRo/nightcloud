import { useParams } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import FileTable from "@/components/NodeTable";
import { getNodesFromDir } from "@/api/NodeAPI";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import buildBreadcrumbs from "@/utils/buildBreadcrumbs";
import type { NodeType } from "@/types";

export default function DirectoryView() {
  const { nodeId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryFn: () => getNodesFromDir(nodeId!),
    queryKey: ["nodes", nodeId],
    enabled: !!nodeId,
    retry: 1,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading files.</div>;
  }

  if (!data) {
    return;
  }

  // TODO: Implementar breadcrumbs correctamente, actualmente este enfoque solo usaria los cacheados.
  // EN caso de que no esten en cache, no se mostraria nada. Deberia hacerse una consulta aparte para obtener todos los nodos.
  const nodes = queryClient
    .getQueriesData<NodeType[]>({
      queryKey: ["nodes"],
    })
    .flatMap(([, data]) => data)
    .filter((d) => d !== undefined);
    
  if (nodes.length) {
    const test = buildBreadcrumbs(nodeId!, nodes);
    console.log("Built breadcrumbs:", test);
  } else {
    console.log("No nodes found in queryClient for breadcrumbs.");
  }

  data.sort((a, b) => {
    if (a.isDir === b.isDir) {
      return a.name.localeCompare(b.name);
    }
    return a.isDir ? -1 : 1;
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-14 px-4 shrink-0 mb-4">
          <h1 className="text-xl font-bold leading-none">
            My Files {" > "}
            {buildBreadcrumbs(nodeId!, nodes)
              .map((n) => n.name)
              .join(" > ")}
          </h1>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold">
              <FaFolderPlus size={18} />
              Create Folder
            </button>
          </div>
        </div>
      </div>

      {/* El contenedor de la tabla crece para ocupar el resto del espacio */}
      <div className="flex-1 min-h-0">
        <FileTable nodes={data} />
      </div>
    </>
  );
}
