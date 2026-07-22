import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Dropdown({
  className = "",
  menuClassName = "",
  onChange,
  options,
  value,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption =
    options.find((option) => String(option.value) === String(value)) ??
    options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        aria-expanded={open}
        className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-[13px] transition ${
          open
            ? "border-[#F4F1EA] bg-[#1A1B20] text-[#F4F1EA]"
            : "border-[#24262D] bg-[#1A1B20] text-[#D7D9DE] hover:border-[#3A3D45] hover:text-[#F4F1EA]"
        }`}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`ml-3 h-4 w-4 shrink-0 text-[#E4BD67] transition ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
        />
      </button>

      {open ? (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[260px] overflow-y-auto rounded-2xl border border-[#24262D] bg-[#101116] p-1 ${menuClassName}`}
        >
          {options.map((option) => {
            const active = String(option.value) === String(value);

            return (
              <button
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition ${
                  active
                    ? "bg-[#211D16] font-semibold text-[#E4BD67]"
                    : "text-[#9EA3AF] hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
                }`}
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
