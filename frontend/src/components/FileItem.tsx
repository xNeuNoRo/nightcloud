import type { NodeType } from "@/types";
import { BsThreeDots } from 'react-icons/bs';
import { FaFolder, FaFile } from 'react-icons/fa6';

type FileItemProps = {
  node: NodeType,
  selectedRows: string[],
  toggleSelect: (id: string) => void;
};

export default function FileItem({ node, selectedRows, toggleSelect }: Readonly<FileItemProps>) {
  const isSelected = selectedRows.includes(node.id);
          
  return (
    <div 
      className={`
      grid grid-cols-[50px_1fr_100px_100px_180px_50px] gap-3 items-center px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent
      ${isSelected ? 'bg-night-primary/10 border-night-primary/20' : 'hover:bg-night-surface hover:border-night-border/50'}
      `}
    >
      {/* Checkbox */}
      <div className="flex justify-center">
        <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleSelect(node.id)}
            className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer" 
        />
      </div>
      
      {/* Nombre e Icono */}
      <div className="flex items-center gap-3 overflow-hidden">
        {node.isDir ? (
            <FaFolder className="text-xl text-night-primary" />
        ) : (
            <FaFile className="text-xl text-night-muted" />
        )}
        <span className={`truncate font-medium ${isSelected ? 'text-white' : 'text-night-text'}`}>
            {node.name}
        </span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">2025-12-20</span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">{node.mime}</span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">{node.size}</span>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end">
        <button className="p-1.5 rounded-full cursor-pointer hover:bg-white/10 text-night-muted hover:text-white transition-colors">
            <BsThreeDots className="text-lg" />
        </button>
      </div>
  </div>
  );
}