import Breadcrumb from "@/components/breadcrumb"
import ProductActions from "@/components/product-actions"
import YouMayAlsoLike from "@/components/you-may-also-like"
import { ImageGallery } from "@/components/ui/image-gallery"
import { useLoaderData } from "@tanstack/react-router"

const ProductDetails = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loaderData = useLoaderData({ from: "/$countryCode/products/$handle" }) as any
  const { product, region, countryCode } = loaderData || {}

  const primaryCategory = product?.categories?.[0]

  const breadcrumbItems = [
    { label: "Home", href: "/$countryCode", params: { countryCode } },
    ...(primaryCategory
      ? [
          {
            label: primaryCategory.name,
            href: "/$countryCode/categories/$handle",
            params: { countryCode, handle: primaryCategory.handle },
          },
        ]
      : []),
    { label: product?.title || "" },
  ]

  return (
    <div className="content-container py-6 md:py-10">
      <Breadcrumb items={breadcrumbItems} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 overflow-visible">
        <div className="overflow-visible md:max-w-sm lg:max-w-md mx-auto w-full">
          <ImageGallery images={product.images || []} />
        </div>

        <div className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--color-text)] leading-tight">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-[var(--color-text-light)] text-sm mt-1">
                {product.subtitle}
              </p>
            )}
          </div>

          <ProductActions product={product} region={region} />

          {product.description && (
            <div className="border-t border-[var(--color-border-light)] pt-5 mt-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">
                Description
              </h3>
              <p className="text-[var(--color-text-light)] text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {product.material && (
            <div className="border-t border-[var(--color-border-light)] pt-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">
                Material
              </h3>
              <p className="text-[var(--color-text-light)] text-sm">
                {product.material}
              </p>
            </div>
          )}
        </div>
      </div>

      <YouMayAlsoLike product={product} region={region} />
    </div>
  )
}

export default ProductDetails
