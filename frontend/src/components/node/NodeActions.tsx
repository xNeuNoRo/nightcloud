import type { NodeType } from "@/types";
import {
  Transition,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Fragment } from "react/jsx-runtime";
import { BsThreeDots } from "react-icons/bs";
import {
  HiOutlinePencil,
  HiOutlineFolderOpen,
  HiOutlineDuplicate,
  HiOutlineTrash,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

type NodeActionsProps = {
  node: NodeType;
};

export default function NodeActions({ node }: Readonly<NodeActionsProps>) {
  // Navegación para abrir los modales correspondientes
  const navigate = useNavigate();
  const openRenameModal = () =>
    navigate(location.pathname + `?renameNode=${node.id}`);
  const openMoveModal = () =>
    navigate(location.pathname + `?moveNode=${node.id}`);
  const openCopyModal = () =>
    navigate(location.pathname + `?copyNode=${node.id}`);
  const openDeleteModal = () =>
    navigate(location.pathname + `?deleteNode=${node.id}`);

  return (
    <Menu as="div" className="relative">
      <MenuButton className="block p-1.5 rounded-full cursor-pointer hover:bg-white/10 text-night-muted hover:text-white transition-colors focus:outline-none">
        <span className="sr-only">Folder options</span>
        <BsThreeDots className="text-lg" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems
          portal
          anchor="bottom end"
          className="fixed mt-2 w-56 py-2 origin-top-right bg-night-surface border border-night-border rounded-md shadow-lg ring-1 ring-night-border/50 focus:outline-none z-50"
        >
          <MenuItem>
            <button
              onClick={openRenameModal}
              className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
            >
              <HiOutlinePencil className="mr-3 text-lg" />
              <span className="tracking-wider">Rename</span>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={openMoveModal}
              className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
            >
              <HiOutlineFolderOpen className="mr-3 text-lg" />
              <span className="tracking-wider">Move</span>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={openCopyModal}
              className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
            >
              <HiOutlineDuplicate className="mr-3 text-lg" />
              <span className="tracking-wider">Copy</span>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={openDeleteModal}
              className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
            >
              <HiOutlineTrash className="mr-3 text-lg" />
              <span className="tracking-wider">Remove</span>
            </button>
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
