import { Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import {
  HiOutlinePencil,
  HiOutlineFolderOpen,
  HiOutlineDuplicate,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCtx } from "@/hooks/context/useCtx";
import { useCtxPayload } from "@/hooks/context/useCtxPayload";

export default function NodeAreaContextMenu() {
  const { closeCtx, isOpen, position } = useCtx();
  const payload = useCtxPayload("node");
  const menuRef = useRef<HTMLDivElement>(null);

  // Lógica para cerrar si hacen click fuera (Click Outside manual)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeCtx();
      }
    };

    // Solo añadimos el listener si el menú está abierto
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeCtx]);

  // Renderizado condicional simple
  if (!isOpen) return null;

  return (
    // Z-Index alto para asegurar que se vea encima de cualquier cosa
    <div className="fixed inset-0 z-9999 pointer-events-none">
      <button
        className="fixed inset-0 pointer-events-auto bg-transparent"
        onClick={closeCtx}
      />

      <Transition
        as={Fragment}
        show={isOpen}
        appear={true}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-5"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-5"
      >
        <div
          ref={menuRef}
          className="fixed pointer-events-auto w-56 py-2 bg-night-surface border border-night-border rounded-md shadow-2xl focus:outline-none flex flex-col"
          style={{
            top: position.y,
            left: position.x,
          }}
        >
          {payload?.selectedNode && (
            <div className="flex flex-col px-1 gap-0.5">
                <button
                  onClick={() => {}}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlinePencil className="mr-2 text-lg" />
                  Rename
                </button>

                <button
                  onClick={() => {}}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineFolderOpen className="mr-2 text-lg" />
                  Move
                </button>

                <button
                  onClick={() => {}}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineDuplicate className="mr-2 text-lg" />
                  Copy
                </button>

                <div className="my-2 border-t border-night-border/30" />

                <button
                  onClick={() => {}}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-red-400 hover:bg-night-border/50 hover:text-red-300 transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineTrash className="mr-2 text-lg" />
                  Remove
                </button>
              </div>
          )}
        </div>
      </Transition>
    </div>
  );
}
