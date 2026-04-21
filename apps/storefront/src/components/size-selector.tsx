import { clsx } from "clsx"
import React from "react"

const SIZES = [
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "1-2 yrs",
  "2-3 yrs",
  "3-4 yrs",
  "4-5 yrs",
  "5-6 yrs",
  "6-7 yrs",
  "7-8 yrs",
  "8-9 yrs",
]

type SizeSelectorProps = {
  selected: string | null
  onSelect: (size: string) => void
  showError?: boolean
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ selected, onSelect, showError }) => {
  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-[var(--color-text)]">
        Select Size
        {selected && (
          <span className="text-[var(--color-primary)] ml-1.5">- {selected}</span>
        )}
      </span>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const isActive = size === selected
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              className={clsx(
                "border text-sm px-3 py-2 rounded-md transition-all duration-200 font-medium",
                isActive
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-[var(--color-text)] hover:border-gray-400"
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
      {showError && !selected && (
        <p className="text-xs text-red-400 font-medium">Please select a size</p>
      )}
    </div>
  )
}

export default SizeSelector
