import { listProducts, retrieveProduct } from "@/lib/data/products";
import { getRegion } from "@/lib/data/regions";
import { queryKeys } from "@/lib/utils/query-keys";
import { generateBreadcrumbSchema } from "@/lib/utils/structured-data";
import ProductDetails from "@/pages/product";
import { HttpTypes } from "@medusajs/types";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/$countryCode/products/$handle")({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: async ({ params, context }): Promise<any> => {
    const { countryCode, handle } = params;
    const { queryClient } = context;

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    });

    if (!region || !handle) {
      throw notFound();
    }

    const product = await queryClient.ensureQueryData({
      queryKey: ["product", handle, region.id],
      queryFn: async () => {
        try {
          return await retrieveProduct({
            handle,
            region_id: region.id,
            fields:
              "*variants, +variants.inventory_quantity, +variants.manage_inventory, +variants.allow_backorder, +variants.calculated_price, *images, *options, *options.values, *collection, *tags, *categories, metadata",
          });
        } catch {
          throw notFound();
        }
      },
    });

    const primaryCategoryId = product.categories?.[0]?.id
    await queryClient.ensureQueryData({
      queryKey: queryKeys.products.related(product.id, region.id),
      queryFn: async () => {
        const params: HttpTypes.StoreProductListParams = {
          fields: "title, handle, *thumbnail, *variants",
          is_giftcard: false,
          limit: 20,
        };

        if (primaryCategoryId) {
          params.category_id = [primaryCategoryId];
        }

        const { products } = await listProducts({
          query_params: params,
          region_id: region.id,
        });

        return products.filter((p) => p.id !== product.id);
      },
    });

    return {
      countryCode,
      region: region as unknown as HttpTypes.StoreRegion,
      product: product as unknown as HttpTypes.StoreProduct,
    };
  },
  head: ({ loaderData }) => {
    const { product, region } = loaderData || {};

    if (!product) {
      return {
        meta: [
          {
            title: "Product Not Found | Fairy Frills",
          },
        ],
      };
    }

    const title = `${product.title} | Fairy Frills`;
    const description =
      product.description ||
      `Shop ${product.title} at Fairy Frills. Handcrafted designer outfit for baby girls.`;
    const ogImage = product.thumbnail || "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg";

    const primaryCategory = product.categories?.[0]
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description,
      image: product.images?.map((img: { url: string }) => img.url).filter(Boolean) || [],
      sku: product.variants?.[0]?.sku || product.id,
      brand: {
        "@type": "Brand",
        name: "Fairy Frills",
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        priceCurrency: region?.currency_code?.toUpperCase(),
        price: product.variants?.[0]?.calculated_price?.calculated_amount
          ? product.variants[0].calculated_price.calculated_amount.toFixed(2)
          : undefined,
      },
      ...(product.metadata?.rating_count && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.metadata.rating_value || "4.5",
          reviewCount: product.metadata.rating_count,
        },
      }),
    };

    const breadcrumbItems = [
      { name: "Home", url: "https://fairyfrills.in/in" },
      ...(primaryCategory
        ? [{ name: primaryCategory.name, url: `https://fairyfrills.in/in/categories/${primaryCategory.handle}` }]
        : []),
      { name: product.title, url: `https://fairyfrills.in/in/products/${product.handle}` },
    ]
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

    const firstImageUrl = product.images?.[0]?.url || product.thumbnail;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        ...(firstImageUrl
          ? [{ rel: "preload", href: firstImageUrl, as: "image", fetchPriority: "high" as const }]
          : []),
        { rel: "canonical", href: `https://fairyfrills.in/in/products/${product.handle}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },
  component: ProductDetails,
});
