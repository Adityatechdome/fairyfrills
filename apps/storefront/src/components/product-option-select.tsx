import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import React from "react"

type ProductOptionSelectProps = {
  option: HttpTypes.StoreProductOption;
  current: string | undefined;
  updateOption: (title: string, value: string) => void;
  title: string;
  disabled: boolean;
  outOfStockValues?: Set<string>;
  "data-testid"?: string;
};

const ProductOptionSelect: React.FC<ProductOptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  outOfStockValues,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-[var(--color-text)]">
        Select {title}
        {current && (
          <span className="text-[var(--color-primary)] ml-1.5">- {current}</span>
        )}
      </span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isActive = v === current
          const isOutOfStock = outOfStockValues?.has(v) ?? false
          const isDisabled = disabled || isOutOfStock
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clsx(
                "border text-sm px-4 py-2.5 rounded-full transition-all duration-200",
                {
                  "border-[var(--color-primary)] bg-[var(--color-primary)] text-white font-medium shadow-sm": isActive && !isOutOfStock,
                  "border-[var(--color-border-light)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]": !isActive && !isDisabled,
                  "border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed": isOutOfStock,
                  "opacity-40 cursor-not-allowed": disabled && !isOutOfStock,
                }
              )}
              disabled={isDisabled}
              data-testid="option-button"
              title={isOutOfStock ? `${v} - Out of stock` : v}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductOptionSelect
