import { getNodesFromRoot } from "@/api/NodeAPI";
import { useQuery } from "@tanstack/react-query";
import { FaFolderPlus } from "react-icons/fa";

export default function HomeView() {
  const { data } = useQuery({
    queryFn: getNodesFromRoot,
    queryKey: ["nodes", "root"],
    retry: 1,
  });

  if (data)
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-2xl font-bold leading-none">My Files</h1>

          {data.map((node) => (
            <div key={node.id}>{node.name}</div>
          ))}

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold">
              <FaFolderPlus size={18} />
              Create Folder
            </button>
          </div>
        </div>
      </div>
    );
}
