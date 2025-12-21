import React, { useState } from 'react';
import { FaFolder, FaFile, FaHeart, FaArrowUp } from 'react-icons/fa6';
import { BsCheckLg, BsThreeDots } from 'react-icons/bs';

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

const FileTable: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === mockData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData.map(item => item.id));
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Tabla - shrink-0 para que no se encoja al hacer scroll */}
      <div className="shrink-0 grid grid-cols-[50px_1fr_100px_100px_180px_50px] items-center px-4 py-3 text-xs font-semibold text-night-muted uppercase tracking-wider border-b border-night-border z-10">
        <div className="flex justify-center">
          <input 
            type="checkbox" 
            checked={selectedRows.length === mockData.length && mockData.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer" 
          />
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-night-text transition-colors group">
          Name 
          <FaArrowUp className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]" />
        </div>
        <div className="text-center">Status</div>
        <div className="text-center">Synced</div>
        <div className="text-center">Last Modified</div>
        <div></div>
      </div>

      {/* Filas - CAMBIO: Aquí aplicamos el overflow-y-auto */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 scrollbar-thin scrollbar-thumb-night-border scrollbar-track-transparent pb-2">
        {mockData.map((item) => {
          const isSelected = selectedRows.includes(item.id);
          
          return (
            <div 
              key={item.id} 
              className={`
                grid grid-cols-[50px_1fr_100px_100px_180px_50px] items-center px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent
                ${isSelected ? 'bg-night-primary/10 border-night-primary/20' : 'hover:bg-night-surface hover:border-night-border/50'}
              `}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer" 
                />
              </div>
              
              {/* Nombre e Icono */}
              <div className="flex items-center gap-3 overflow-hidden">
                {item.type === 'folder' ? (
                  <FaFolder className="text-xl text-night-primary" />
                ) : (
                  <FaFile className="text-xl text-night-muted" />
                )}
                <span className={`truncate font-medium ${isSelected ? 'text-white' : 'text-night-text'}`}>
                  {item.name}
                </span>
              </div>

              {/* Status (Heart) */}
              <div className="flex justify-center">
                <FaHeart 
                  className={`text-sm transition-colors ${item.isFavorite ? 'text-night-primary' : 'text-night-border group-hover:text-night-muted'}`} 
                />
              </div>

              {/* Synced */}
              <div className="flex justify-center">
                {item.synced ? (
                  <BsCheckLg className="text-lg text-night-success drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                ) : (
                  <span className="text-night-muted">-</span>
                )}
              </div>

              {/* Date */}
              <div className="text-night-muted text-xs font-mono">
                {item.lastModified}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button className="p-1.5 rounded-full cursor-pointer hover:bg-white/10 text-night-muted hover:text-white transition-colors">
                  <BsThreeDots className="text-lg" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTable;