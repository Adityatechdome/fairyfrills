import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HttpTypes } from "@medusajs/types"
import { AddressFormData } from "@/lib/types/global"
import { clsx } from "clsx"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Country, State, City } from "country-state-city"

// Searchable dropdown that mirrors the State/City Select UX:
// - opens on trigger click, shows search input auto-focused at top
// - typing filters the list immediately (same feel as Radix Select's built-in search)
interface SearchableSelectProps {
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  triggerClassName?: string
  disabled?: boolean
}

const SearchableSelect = ({
  value,
  placeholder,
  options,
  onChange,
  triggerClassName,
  disabled,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  const selectedLabel = options.find((o) => o.value === value)?.label

  const handleOpen = () => {
    if (disabled) return
    setSearch("")
    setOpen(true)
    // Focus the search input immediately after paint
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setSearch("")
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — matches SelectTrigger styling */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={clsx(
          triggerClassName,
          "flex items-center justify-between w-full text-left",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={clsx(!selectedLabel && "text-zinc-400")}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={clsx("ml-2 shrink-0 text-zinc-400 transition-transform", open && "rotate-180")}
          width="14" height="14" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden">
          {/* Search input — auto-focused, same feel as native Radix search */}
          <div className="sticky top-0 bg-white border-b border-zinc-100 px-2 pt-2 pb-1.5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setSearch("") }
                if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].value)
              }}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-[#E799AA] focus:ring-1 focus:ring-[#E799AA]/30"
            />
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={clsx(
                    "w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition-colors flex items-center justify-between",
                    opt.value === value && "text-[#E799AA] font-medium"
                  )}
                >
                  {opt.label}
                  {opt.value === value && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type AddressData = HttpTypes.StoreCreateCustomerAddress | HttpTypes.StoreAddAddress | AddressFormData;

interface AddressFormProps {
  addressFormData: AddressData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAddressFormData: React.Dispatch<React.SetStateAction<any>>;
  shouldHandleSubmit?: boolean;
  setIsFormValid?: (isValid: boolean) => void;
  onSubmit?:
    | ((address: HttpTypes.StoreCreateCustomerAddress) => void)
    | ((address: HttpTypes.StoreAddAddress) => void);
  onCancel?: () => void;
  countries?: HttpTypes.StoreRegion["countries"];
  isLoading?: boolean;
  className?: string;
}

const fieldBaseClass =
  "w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E799AA] focus:ring-2 focus:ring-[#E799AA]/20 focus:bg-white transition-all duration-200"

const FieldIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
    {children}
  </div>
)

const PersonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const LocationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const selectTriggerClass = "w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:border-[#E799AA] focus:ring-2 focus:ring-[#E799AA]/20 focus:bg-white transition-all duration-200 h-auto shadow-none ring-0"

// Convert country-state-city isoCode to Medusa-compatible 2-letter code (lowercase)
function toMedusaCountryCode(isoCode: string): string {
  return isoCode.toLowerCase()
}

function toISOCode(medusaCode: string): string {
  return medusaCode.toUpperCase()
}

const AddressForm = ({
  addressFormData,
  setAddressFormData,
  shouldHandleSubmit = false,
  setIsFormValid,
  onSubmit,
  onCancel,
  isLoading,
  className,
}: AddressFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // All countries from country-state-city library
  const allCountries = useMemo(() => Country.getAllCountries(), [])

  const countryOptions = useMemo(
    () => allCountries.map((c) => ({ value: toMedusaCountryCode(c.isoCode), label: c.name })),
    [allCountries]
  )

  // Selected country ISO code (uppercase) for library lookups
  const selectedISOCode = useMemo(
    () => toISOCode(addressFormData.country_code || ""),
    [addressFormData.country_code]
  )

  // States for selected country
  const stateOptions = useMemo(() => {
    if (!selectedISOCode) return []
    return State.getStatesOfCountry(selectedISOCode)
  }, [selectedISOCode])

  // Cities for selected state
  const cityOptions = useMemo(() => {
    if (!selectedISOCode || !addressFormData.province) return []
    // Find the state isoCode that matches the stored province name or isoCode
    const matchedState = stateOptions.find(
      (s) => s.name === addressFormData.province || s.isoCode === addressFormData.province
    )
    if (!matchedState) return []
    return City.getCitiesOfState(selectedISOCode, matchedState.isoCode)
  }, [selectedISOCode, addressFormData.province, stateOptions])

  const handleChange = (field: string, value: string) => {
    setAddressFormData((prev: AddressData) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!addressFormData.first_name?.trim())
      newErrors.first_name = "First name is required"
    if (!addressFormData.last_name?.trim())
      newErrors.last_name = "Last name is required"
    if (!addressFormData.address_1?.trim())
      newErrors.address_1 = "Address is required"
    if (!addressFormData.city?.trim())
      newErrors.city = "City is required"
    if (!addressFormData.province?.trim())
      newErrors.province = "State / Province is required"
    if (!addressFormData.postal_code?.trim())
      newErrors.postal_code = "Postal code is required"
    if (!addressFormData.country_code?.trim())
      newErrors.country_code = "Country is required"

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    setIsFormValid?.(isValid)
    return isValid
  }, [addressFormData, setIsFormValid])

  useEffect(() => {
    validateForm()
  }, [validateForm])

  const handleSubmit = () => {
    setTouchedFields({
      first_name: true,
      last_name: true,
      address_1: true,
      city: true,
      province: true,
      postal_code: true,
      country_code: true,
    })
    if (!validateForm() || !shouldHandleSubmit) return
    if (onSubmit) {
      onSubmit(addressFormData as HttpTypes.StoreCreateCustomerAddress & HttpTypes.StoreAddAddress)
    }
  }

  return (
    <div className={clsx("space-y-4", className)}>
      {/* First Name + Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="first_name" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            First Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <FieldIcon><PersonIcon /></FieldIcon>
            <input
              name="first_name"
              id="first_name"
              type="text"
              autoComplete="given-name"
              value={addressFormData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              placeholder="First name"
              className={clsx(fieldBaseClass, "pl-10")}
            />
          </div>
          {errors.first_name && touchedFields.first_name && (
            <p className="text-xs text-rose-500">{errors.first_name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="last_name" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            Last Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <FieldIcon><PersonIcon /></FieldIcon>
            <input
              name="last_name"
              id="last_name"
              type="text"
              autoComplete="family-name"
              value={addressFormData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              placeholder="Last name"
              className={clsx(fieldBaseClass, "pl-10")}
            />
          </div>
          {errors.last_name && touchedFields.last_name && (
            <p className="text-xs text-rose-500">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Address Line 1 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address_1" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          Address Line 1 <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <FieldIcon><LocationIcon /></FieldIcon>
          <input
            name="address_1"
            id="address_1"
            type="text"
            autoComplete="street-address"
            value={addressFormData.address_1}
            onChange={(e) => handleChange("address_1", e.target.value)}
            placeholder="Street address"
            className={clsx(fieldBaseClass, "pl-10")}
          />
        </div>
        {errors.address_1 && touchedFields.address_1 && (
          <p className="text-xs text-rose-500">{errors.address_1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address_2" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          Address Line 2 <span className="font-normal text-zinc-400 normal-case">(optional)</span>
        </label>
        <input
          name="address_2"
          id="address_2"
          type="text"
          value={addressFormData.address_2}
          onChange={(e) => handleChange("address_2", e.target.value)}
          placeholder="Apartment, suite, floor, etc."
          className={fieldBaseClass}
        />
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="country_code" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          Country <span className="text-rose-400">*</span>
        </label>
        <SearchableSelect
          value={addressFormData.country_code || ""}
          placeholder="Select country"
          options={countryOptions}
          onChange={(value) => {
            handleChange("country_code", value)
            handleChange("province", "")
            handleChange("city", "")
          }}
          triggerClassName={selectTriggerClass}
        />
        {errors.country_code && touchedFields.country_code && (
          <p className="text-xs text-rose-500">{errors.country_code}</p>
        )}
      </div>

      {/* State + City + Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State / Province */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="province" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            State / Province <span className="text-rose-400">*</span>
          </label>
          {stateOptions.length > 0 ? (
            <Select
              name="province"
              value={addressFormData.province || ""}
              onValueChange={(value) => {
                handleChange("province", value)
                // Reset city when state changes
                handleChange("city", "")
              }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {stateOptions.map((state) => (
                  <SelectItem key={state.isoCode} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              name="province"
              id="province"
              type="text"
              autoComplete="address-level1"
              value={addressFormData.province || ""}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder="State / Province"
              className={fieldBaseClass}
            />
          )}
          {errors.province && touchedFields.province && (
            <p className="text-xs text-rose-500">{errors.province}</p>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            City <span className="text-rose-400">*</span>
          </label>
          {cityOptions.length > 0 ? (
            <Select
              name="city"
              value={addressFormData.city || ""}
              onValueChange={(value) => handleChange("city", value)}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cityOptions.map((city) => (
                  <SelectItem key={`${city.name}-${city.stateCode}`} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              name="city"
              id="city"
              type="text"
              autoComplete="address-level2"
              value={addressFormData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
              className={fieldBaseClass}
            />
          )}
          {errors.city && touchedFields.city && (
            <p className="text-xs text-rose-500">{errors.city}</p>
          )}
        </div>

        {/* Postal Code */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="postal_code" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
            Postal Code <span className="text-rose-400">*</span>
          </label>
          <input
            name="postal_code"
            id="postal_code"
            type="text"
            autoComplete="postal-code"
            value={addressFormData.postal_code || ""}
            onChange={(e) => handleChange("postal_code", e.target.value)}
            placeholder="PIN / ZIP code"
            className={fieldBaseClass}
          />
          {errors.postal_code && touchedFields.postal_code && (
            <p className="text-xs text-rose-500">{errors.postal_code}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          Phone
        </label>
        <div className="flex gap-0">
          <div className="flex items-center gap-2 px-3 py-3 rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-100 text-sm text-zinc-600 whitespace-nowrap">
            <span>🇮🇳</span>
            <span>+91</span>
          </div>
          <div className="relative flex-1">
            <input
              name="phone"
              id="phone"
              type="tel"
              autoComplete="tel"
              maxLength={10}
              value={addressFormData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Phone number"
              className="w-full px-4 py-3 rounded-r-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E799AA] focus:ring-2 focus:ring-[#E799AA]/20 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Action buttons (for account address forms) */}
      {shouldHandleSubmit && (
        <div className="flex items-center justify-end gap-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} variant="primary">
            Save
          </Button>
        </div>
      )}
    </div>
  )
}

export default AddressForm
