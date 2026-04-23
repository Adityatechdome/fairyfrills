import { Thumbnail } from "@/components/ui/thumbnail"
import { getPriceInfoWithDiscount } from "@/lib/utils/price"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const priceInfo = getPriceInfoWithDiscount(product)

  // Build keyword-rich alt text: "Product Title | Handcrafted Girls Dress | Fairy Frills"
  const primaryCategory = product.categories?.[0]?.name || "Girls Dress"
  const imageAlt = `${product.title} | Handcrafted ${primaryCategory} | Fairy Frills`

  return (
    <Link
      to="/$countryCode/products/$handle"
      params={{ countryCode, handle: product.handle }}
      className="group flex flex-col w-full"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--color-primary-50)] relative rounded-lg">
        <Thumbnail
          thumbnail={product.thumbnail || product.images?.[0]?.url}
          alt={imageAlt}
          className="absolute inset-0 object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[var(--color-text)] text-sm font-medium line-clamp-2">
          {product.title}
        </span>
        {priceInfo ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--color-primary)]">
                {priceInfo.realFormatted}
              </span>
              {priceInfo.strikethroughFormatted && (
                <span className="text-xs text-gray-400 line-through">
                  {priceInfo.strikethroughFormatted}
                </span>
              )}
            </div>
            {priceInfo.discountPercentage > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 w-fit">
                {priceInfo.discountPercentage}% OFF
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
