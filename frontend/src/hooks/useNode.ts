import { getAncestorsOfNodeById, getNodesFromDir } from "@/api/NodeAPI";
import type { NodeType } from "@/types";
import sortNodes from "@/utils/sortNodes";
import { useQuery } from "@tanstack/react-query";

export function useNode(
  nodeId: NodeType["id"] | undefined,
  params?: { includeAncestors?: boolean }
) {
  const includeAncestors = params && params.includeAncestors !== false;

  const {
    data: nodeData,
    isLoading: nodeLoading,
    error: nodeError,
  } = useQuery({
    queryFn: () => getNodesFromDir(nodeId!),
    queryKey: ["nodes", nodeId],
    enabled: !!nodeId,
    retry: 1,
  });

  const {
    data: ancestorsData,
    isLoading: ancestorsLoading,
    error: ancestorsError,
  } = useQuery({
    queryFn: () => getAncestorsOfNodeById(nodeId!),
    queryKey: ["ancestors", nodeId],
    enabled: !!nodeId && includeAncestors,
  });

  return {
    nodeData: nodeData ? sortNodes(nodeData) : undefined,
    nodeLoading,
    nodeError,
    ancestorsData: includeAncestors ? ancestorsData : undefined,
    ancestorsLoading: includeAncestors ? ancestorsLoading : false,
    ancestorsError: includeAncestors ? ancestorsError : undefined,
  };
}
