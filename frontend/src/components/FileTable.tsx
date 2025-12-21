import { useState } from 'react';
import { FaArrowUp } from 'react-icons/fa6';
import type { NodeType } from '@/types';
import FileItem from './FileItem';

type FileData = {
  id: number;
  name: string;
  type: 'folder' | 'file';
  isFavorite: boolean;
  synced: boolean;
  lastModified: string;
}

const mockData: FileData[] = [
  { id: 1, name: 'Linux ISOs', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 2, name: 'Window ISOs', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 3, name: 'ITLA', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 4, name: 'Documentos', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 5, name: 'Proyectos React', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 6, name: 'Mega Uploads', type: 'folder', isFavorite: false, synced: true, lastModified: '-' },
  { id: 7, name: 'Diseños UI', type: 'folder', isFavorite: true, synced: true, lastModified: '-' },
  { id: 8, name: 'presupuesto_2025.pdf', type: 'file', isFavorite: false, synced: true, lastModified: '2024-12-20' },
  { id: 9, name: 'presupuesto_2025.pdf', type: 'file', isFavorite: false, synced: true, lastModified: '2024-12-20' },
  { id: 10, name: 'presupuesto_2025.pdf', type: 'file', isFavorite: false, synced: true, lastModified: '2024-12-20' },
  { id: 11, name: 'presupuesto_2025.pdf', type: 'file', isFavorite: false, synced: true, lastModified: '2024-12-20' },
  { id: 12, name: 'backend_v2.zip', type: 'file', isFavorite: false, synced: true, lastModified: '2024-12-21' },
  { id: 13, name: 'notes.txt', type: 'file', isFavorite: true, synced: true, lastModified: '2024-12-22' },
];

type FileTableProps = {
  nodes: NodeType[]
}

export default function FileTable({ nodes }: Readonly<FileTableProps>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === nodes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(nodes.map(item => item.id));
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Tabla - shrink-0 para que no se encoja al hacer scroll */}
      <div className="shrink-0 grid grid-cols-[50px_1fr_100px_100px_180px_50px] gap-4 items-center px-4 py-3 text-xs font-semibold text-night-muted uppercase tracking-wider border-b border-night-border z-10">
        <div className="flex justify-center">
          <input 
            type="checkbox" 
            checked={selectedRows.length === nodes.length && nodes.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer" 
          />
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-night-text transition-colors group">
          Name 
          <FaArrowUp className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]" />
        </div>
        <div className="">Date added</div>
        <div className="">Type</div>
        <div className="">Size</div>
        <div></div>
      </div>

      {/* Filas */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 scrollbar-thin scrollbar-thumb-night-border scrollbar-track-transparent pb-2">
        {nodes.map((node) => (
          <FileItem 
            key={node.id}
            node={node}
            selectedRows={selectedRows}
            toggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
};