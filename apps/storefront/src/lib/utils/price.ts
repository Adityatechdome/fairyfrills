import { isEmpty } from "@/lib/utils/validation"
import { HttpTypes } from "@medusajs/types"

// ============ FORMAT PRICE ============

type FormatPriceParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const formatPrice = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: FormatPriceParams): string => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}

// ============ PERCENTAGE DIFF ============

export const getPricePercentageDiff = (original: number, calculated: number): string => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed()
}

// ============ PRODUCT PRICE ============

export const getPricesForVariant = (variant: HttpTypes.StoreProductVariant | undefined): {
  calculated_price_number: number;
  calculated_price: string;
  original_price_number: number;
  original_price: string;
  currency_code: string;
  price_type: string;
  percentage_diff: string;
} | null => {
  const calculatedPrice = variant?.calculated_price
  if (!calculatedPrice?.calculated_amount || !calculatedPrice.currency_code) {
    return null
  }

  const calculatedAmount = calculatedPrice.calculated_amount
  const originalAmount = calculatedPrice.original_amount ?? calculatedAmount
  const currencyCode = calculatedPrice.currency_code
  const priceListType = calculatedPrice.calculated_price?.price_list_type ?? ""

  return {
    calculated_price_number: calculatedAmount,
    calculated_price: formatPrice({
      amount: calculatedAmount,
      currency_code: currencyCode,
    }),
    original_price_number: originalAmount,
    original_price: formatPrice({
      amount: originalAmount,
      currency_code: currencyCode,
    }),
    currency_code: currencyCode,
    price_type: priceListType,
    percentage_diff: getPricePercentageDiff(
      originalAmount,
      calculatedAmount
    ),
  }
}

// ============ DISCOUNT CALCULATIONS ============

/**
 * Get discount percentage from product metadata
 * Returns 0 if no discount is set
 */
export const getDiscountPercentage = (product: HttpTypes.StoreProduct): number => {
  const metadataDiscount = product.metadata?.discount_percentage
  
  if (typeof metadataDiscount === 'number') {
    return Math.max(0, Math.min(100, metadataDiscount))
  } else if (typeof metadataDiscount === 'string') {
    const parsed = parseFloat(metadataDiscount)
    if (!isNaN(parsed)) {
      return Math.max(0, Math.min(100, parsed))
    }
  }
  
  return 0 // no discount if not set
}

/**
 * Calculate strikethrough price using the formula:
 * Strikethrough Price = Selling Price / (1 - discount%)
 * 
 * Example: If selling price is ₹5000 and discount is 60%
 * Strikethrough = ₹5000 / (1 - 0.60) = ₹12,500
 */
export const calculateStrikethroughPrice = (
  sellingPrice: number,
  discountPercentage: number
): number | null => {
  // If no discount, no strikethrough price
  if (discountPercentage <= 0) {
    return null
  }
  
  // If discount is 100%, formula would divide by zero, so cap at 99%
  const cappedDiscount = Math.min(discountPercentage, 99)
  
  return sellingPrice / (1 - cappedDiscount / 100)
}

/**
 * Get price info with correct discount calculations for a product
 */
export const getPriceInfoWithDiscount = (
  product: HttpTypes.StoreProduct
): {
  realPrice: number
  realFormatted: string
  strikethroughPrice: number | null
  strikethroughFormatted: string | null
  discountPercentage: number
  currency: string
} | null => {
  const variantsWithPrice = (product.variants ?? []).filter(
    (v) => !!v.calculated_price?.calculated_amount
  )
  
  if (variantsWithPrice.length === 0) return null
  
  const cheapest = variantsWithPrice.sort(
    (a, b) =>
      (a.calculated_price!.calculated_amount ?? 0) -
      (b.calculated_price!.calculated_amount ?? 0)
  )[0]
  
  const realPrice = cheapest.calculated_price!.calculated_amount!
  const currency = cheapest.calculated_price!.currency_code!
  const discountPercentage = getDiscountPercentage(product)
  
  const strikethroughPrice = calculateStrikethroughPrice(realPrice, discountPercentage)
  
  return {
    realPrice,
    realFormatted: formatPrice({ amount: realPrice, currency_code: currency }),
    strikethroughPrice,
    strikethroughFormatted: strikethroughPrice
      ? formatPrice({ amount: strikethroughPrice, currency_code: currency })
      : null,
    discountPercentage,
    currency,
  }
}

export function getProductPrice({
  product,
  variant_id,
}: {
  product: HttpTypes.StoreProduct
  variant_id?: string
}): {
  product: HttpTypes.StoreProduct;
  cheapestPrice: {
    calculated_price_number: number;
    calculated_price: string;
    original_price_number: number;
    original_price: string;
    currency_code: string;
    price_type: string;
    percentage_diff: string;
  } | null;
  variantPrice: {
    calculated_price_number: number;
    calculated_price: string;
    original_price_number: number;
    original_price: string;
    currency_code: string;
    price_type: string;
    percentage_diff: string;
  } | null;
} {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const variantsWithPrice = product.variants.filter(
      (v): v is HttpTypes.StoreProductVariant & { calculated_price: NonNullable<HttpTypes.StoreProductVariant["calculated_price"]> } =>
        !!v.calculated_price
    )
    const cheapestVariant = variantsWithPrice.sort((a, b) => {
      return (
        (a.calculated_price.calculated_amount ?? 0) -
        (b.calculated_price.calculated_amount ?? 0)
      )
    })[0]

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variant_id) {
      return null
    }

    const variant = product.variants?.find(
      (v) => v.id === variant_id || v.sku === variant_id
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
