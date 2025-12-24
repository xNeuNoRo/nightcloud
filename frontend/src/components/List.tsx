import type { ListOption } from "@/stores/listSlice";
import { useAppStore } from "@/stores/useAppStore";
import classNames from "@/utils/classNames";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { HiCheckCircle, HiChevronDown } from "react-icons/hi";

type ListProps = {
  options: ListOption[];
  defaultOption?: ListOption;
  maxHeight?: "large" | "normal" | "small";
};

export default function List({
  options,
  defaultOption,
  maxHeight = "normal",
}: Readonly<ListProps>) {
  const { listSelectedOption, listSetSelectedOption } = useAppStore();
  // Establecer la opción por defecto si se proporciona y no hay ninguna seleccionada
  useEffect(() => {
    if (defaultOption && !listSelectedOption) {
      listSetSelectedOption(defaultOption);
    }
  }, [defaultOption, listSelectedOption, listSetSelectedOption]);

  const maxHeightClass = {
    large: "max-h-80",
    normal: "max-h-60",
    small: "max-h-40",
  }[maxHeight];

  return (
    <Listbox onChange={listSetSelectedOption}>
      {({ open }) => (
        <>
          <ListboxButton className="p-2 px-4 bg-night-surface rounded-lg border border-night-border hover:cursor-pointer w-full focus:outline-0 flex justify-between items-center">
            {listSelectedOption ? (
              <div className="flex items-center gap-3">
                {listSelectedOption.icon && (
                  <div className="text-night-muted">
                    <listSelectedOption.icon />
                  </div>
                )}
                {listSelectedOption.name}
              </div>
            ) : (
              <span className="text-night-muted">Select an option</span>
            )}
            <HiChevronDown
              className={classNames(
                open ? "rotate-180" : "",
                "text-xl text-night-text transform transition-all duration-300"
              )}
            />
          </ListboxButton>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <ListboxOptions
              className={classNames(
                maxHeightClass,
                "p-2 border border-night-border rounded-lg bg-night-surface focus:outline-0 shadow-lg overflow-y-auto divide-y divide-night-muted/20 scrollbar-thin scrollbar-thumb-night-border scrollbar-track-transparent"
              )}
            >
              {listSelectedOption && (
                <ListboxOption
                  value={null}
                  className="p-2 group hover:cursor-pointer rounded-md mx-1 transition-all duration-150 cursor-pointer"
                >
                  <span className="text-night-muted transform transition-all duration-150 group-hover:text-night-text">
                    --- Select an option ---
                  </span>
                </ListboxOption>
              )}
              {Object.entries(options).map(([, option]) => (
                <ListboxOption
                  key={option.id}
                  value={option}
                  className={({ focus }) =>
                    classNames(
                      "flex justify-between gap-2 p-2 group hover:cursor-pointer rounded-md mx-1 transition-all duration-150 cursor-pointer",
                      listSelectedOption?.id === option.id
                        ? "bg-night-primary/20 border-night-primary/20"
                        : "",
                      focus ? "bg-night-primary/10" : ""
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <div className="text-night-muted transform transition-all duration-150 group-hover:text-night-text group-hover:translate-x-1">
                        <option.icon />
                      </div>
                    )}
                    <span className="text-night-muted transform transition-all duration-150 group-hover:translate-x-1 group-hover:text-night-text">
                      {option.name}
                    </span>
                  </div>
                  {listSelectedOption?.id === option.id && (
                    <HiCheckCircle className="w-5 h-5 text-night-text opacity-80" />
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </>
      )}
    </Listbox>
  );
}
