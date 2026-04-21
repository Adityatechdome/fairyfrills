import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { HttpTypes } from "@medusajs/types"
import { queryKeys } from "@/lib/utils/query-keys"
import { sdk } from "@/lib/utils/sdk"

export const useAllProducts = ({
  query_params,
  region_id,
}: {
  query_params?: HttpTypes.StoreProductListParams
  region_id?: string
} = {}) => {
  return useQuery({
    queryKey: queryKeys.products.list(query_params, region_id),
    queryFn: async () => {
      const response = await sdk.store.product.list({
        limit: 500,
        offset: 0,
        region_id,
        fields: "*images, metadata",
        ...query_params,
      })
      return response.products
    },
    enabled: !!region_id,
  })
}

export const useProducts = ({
  query_params,
  region_id,
}: {
  query_params?: HttpTypes.StoreProductListParams
  region_id?: string
} = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(query_params, region_id),
    queryFn: async ({ pageParam }) => {
      const limit = query_params?.limit || 12
      const _page_param = Math.max(pageParam, 1)
      const offset = _page_param === 1 ? 0 : (_page_param - 1) * limit

      const response = await sdk.store.product.list({
        limit,
        offset,
        region_id,
        fields: "*images, metadata",
        ...query_params,
      })

      const next_page = offset + limit < response.count ? _page_param + 1 : null

      return {
        products: response.products,
        count: response.count,
        next_page,
      }
    },
    getNextPageParam: (lastPage) => lastPage.next_page,
    getPreviousPageParam: (firstPage) => firstPage.next_page,
    initialPageParam: 1,
    enabled: !!region_id,
  })
}

export const useProduct = ({
  handle,
  region_id,
  fields,
}: {
  handle: string;
  region_id?: string;
  fields?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.products.detail(handle, region_id),
    queryFn: async () => {
      const { products } = await sdk.store.product.list({
        handle: handle,
        region_id,
        fields: fields ||
          "*variants, +variants.inventory_quantity, +variants.manage_inventory, +variants.allow_backorder, *images, *options, *options.values, *collection, *tags, metadata",
      })

      if (!products || products.length === 0) {
        throw new Error(`Product with handle ${handle} not found`)
      }

      return products[0]
    },
    enabled: !!handle && !!region_id,
  })
}

export const useRelatedProducts = ({
  product_id,
  region_id,
  category_id,
}: {
  product_id: string;
  region_id?: string;
  category_id?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.products.related(product_id, region_id),
    queryFn: async () => {
      const params: HttpTypes.StoreProductListParams = {
        fields: "title, handle, *thumbnail, *variants, *images, metadata",
        is_giftcard: false,
        limit: 20,
      }

      if (category_id) {
        params.category_id = [category_id]
      }

      const response = await sdk.store.product.list({
        ...params,
        region_id,
      })

      return response.products.filter((product) => product.id !== product_id)
    },
    enabled: !!product_id && !!region_id,
  })
}

export const useInfiniteProducts = ({
  query_params,
  region_id,
  limit = 20,
}: {
  query_params?: HttpTypes.StoreProductListParams
  region_id?: string
  limit?: number
}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list({ ...query_params, limit, infinite: true }, region_id),
    queryFn: async ({ pageParam }) => {
      const _page = Math.max(pageParam as number, 1)
      const offset = (_page - 1) * limit

      const response = await sdk.store.product.list({
        limit,
        offset,
        region_id,
        fields: "*images, metadata",
        ...query_params,
      })

      const next_page = offset + limit < response.count ? _page + 1 : null

      return {
        products: response.products,
        count: response.count,
        next_page,
      }
    },
    getNextPageParam: (lastPage) => lastPage.next_page,
    initialPageParam: 1,
    enabled: !!region_id,
  })
}

export const usePaginatedProducts = ({
  query_params,
  region_id,
  page = 1,
  limit = 12,
}: {
  query_params?: HttpTypes.StoreProductListParams
  region_id?: string
  page?: number
  limit?: number
}) => {
  const offset = (page - 1) * limit

  return useQuery({
    queryKey: queryKeys.products.list({ ...query_params, limit, offset }, region_id),
    queryFn: async () => {
      const response = await sdk.store.product.list({
        limit,
        offset,
        region_id,
        fields: "*images, *variants.calculated_price, metadata",
        ...query_params,
      })
      return {
        products: response.products,
        count: response.count,
        totalPages: Math.ceil(response.count / limit),
      }
    },
    enabled: !!region_id,
    placeholderData: (prev) => prev,
  })
}

export const useLatestProducts = ({
  limit = 4,
  region_id,
}: {
  limit?: number
  region_id?: string
} = {}) => {
  return useQuery({
    queryKey: queryKeys.products.latest(limit, region_id),
    queryFn: async () => {
      const response = await sdk.store.product.list({
        limit,
        offset: 0,
        order: "-created_at",
        region_id,
        fields: "*images, metadata",
      })

      return {
        products: response.products,
        count: response.count,
        next_page: null,
      }
    },
    enabled: !!region_id,
  })
}
