import type { AncestorType } from "@/types";
import { Link } from "react-router-dom";

type BreadcrumbProps = {
  n: AncestorType;
};

export default function Breadcrumb({ n }: Readonly<BreadcrumbProps>) {
  return (
    <Link key={n.id} to={`/directory/${n.id}`}>
      <span className="hover:underline">{n.name}</span> {" > "}
    </Link>
  );
}
