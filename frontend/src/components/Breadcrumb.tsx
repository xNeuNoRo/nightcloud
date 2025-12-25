import type { AncestorType } from "@/types";
import classNames from "@/utils/classNames";
import { useDroppable } from "@dnd-kit/core";
import { Link } from "react-router-dom";

type BreadcrumbProps = {
  n: Pick<AncestorType, "id" | "name" | "parentId">;
};

export default function Breadcrumb({ n }: Readonly<BreadcrumbProps>) {
  const { isOver, setNodeRef } = useDroppable({
    id: n.id,
    data: {
      dropAction: "breadcrumb_dropable", // Para identificar droppables por feat en el futuro
      ...n,
    },
  });

  const isRoot = n.id === "breadcrumb:root";

  return (
    <>
      <Link
        ref={setNodeRef}
        className={classNames(
          isOver
            ? "border-night-primary bg-night-primary/10 text-night-primary rounded-sm"
            : "border-transparent hover:border-night-primary",
          "inline-block max-w-30 p-1 truncate border-b-2 border-transparent hover:border-night-primary transition-colors duration-200"
        )}
        key={n.id}
        to={isRoot ? `/` : `/directory/${n.id}`}
      >
        {n.name}
      </Link>
      {" > "}
    </>
  );
}
