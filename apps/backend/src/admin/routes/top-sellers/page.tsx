import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Text, Badge, Switch } from "@medusajs/ui"
import { Star, Trash, ArrowUpMini, ArrowDownMini, MagnifyingGlass } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

type TopSeller = {
  id: string
  product_id: string
  sort_order: number
  is_active: boolean
}

type Product = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

type TopSellerWithProduct = TopSeller & { product?: Product }

const TopSellersPage = () => {
  const [topSellers, setTopSellers] = useState<TopSellerWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [tsData, productsData] = await Promise.all([
        sdk.client.fetch<{ top_sellers: TopSeller[] }>("/admin/top-sellers"),
        sdk.client.fetch<{ products: Product[] }>("/admin/products?limit=500&fields=id,title,handle,thumbnail"),
      ])

      const ts = tsData.top_sellers || []
      const products: Product[] = (productsData as any).products || []

      const enriched: TopSellerWithProduct[] = ts
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.product_id),
        }))

      setTopSellers(enriched)
    } catch (e) {
      console.error("Failed to fetch top sellers", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const data = await sdk.client.fetch<any>(
        `/admin/products?q=${encodeURIComponent(q)}&limit=10&fields=id,title,handle,thumbnail`
      )
      const products: Product[] = data.products || []
      const existingIds = new Set(topSellers.map((ts) => ts.product_id))
      setSearchResults(products.filter((p) => !existingIds.has(p.id)))
    } catch (e) {
      console.error("Search failed", e)
    } finally {
      setIsSearching(false)
    }
  }, [topSellers])

  const handleAdd = async (product: Product) => {
    setSaving("add")
    try {
      const nextOrder = topSellers.length > 0
        ? Math.max(...topSellers.map((ts) => ts.sort_order)) + 1
        : 1
      await sdk.client.fetch("/admin/top-sellers", {
        method: "POST",
        body: { product_id: product.id, sort_order: nextOrder, is_active: true },
      })
      setSearchQuery("")
      setSearchResults([])
      setShowSearch(false)
      await fetchData()
    } catch (e) {
      console.error("Failed to add top seller", e)
    } finally {
      setSaving(null)
    }
  }

  const handleToggle = async (item: TopSellerWithProduct) => {
    setSaving(item.id)
    try {
      await sdk.client.fetch(`/admin/top-sellers/${item.id}`, {
        method: "POST",
        body: { is_active: !item.is_active },
      })
      setTopSellers((prev) =>
        prev.map((ts) => ts.id === item.id ? { ...ts, is_active: !item.is_active } : ts)
      )
    } catch (e) {
      console.error("Failed to toggle", e)
    } finally {
      setSaving(null)
    }
  }

  const handleRemove = async (id: string) => {
    setSaving(id)
    try {
      await sdk.client.fetch(`/admin/top-sellers/${id}`, { method: "DELETE" })
      await fetchData()
    } catch (e) {
      console.error("Failed to remove top seller", e)
    } finally {
      setSaving(null)
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newList = [...topSellers]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newList.length) return

    const tmp = newList[index]
    newList[index] = newList[swapIndex]
    newList[swapIndex] = tmp

    const updated = newList.map((ts, i) => ({ ...ts, sort_order: i + 1 }))
    setTopSellers(updated)

    setSaving("reorder")
    try {
      await Promise.all(
        updated.map((ts) =>
          sdk.client.fetch(`/admin/top-sellers/${ts.id}`, {
            method: "POST",
            body: { sort_order: ts.sort_order },
          })
        )
      )
    } catch (e) {
      console.error("Failed to reorder", e)
      await fetchData()
    } finally {
      setSaving(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Top Sellers</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Manage which products appear in the Top Sellers section on the homepage
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setShowSearch(!showSearch)
            setSearchQuery("")
            setSearchResults([])
          }}
        >
          {showSearch ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showSearch && (
        <div className="px-6 py-4 space-y-3">
          <Text size="small" weight="plus">Search for a product to add</Text>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted">
              <MagnifyingGlass />
            </div>
            <Input
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {isSearching && (
            <Text size="small" className="text-ui-fg-subtle">Searching...</Text>
          )}
          {searchResults.length > 0 && (
            <div className="border border-ui-border-base rounded-lg overflow-hidden divide-y divide-ui-border-base">
              {searchResults.map((product) => (
                <div key={product.id} className="flex items-center justify-between px-4 py-3 hover:bg-ui-bg-base-hover">
                  <div className="flex items-center gap-3">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-md bg-ui-bg-subtle"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-ui-bg-subtle flex items-center justify-center">
                        <Star className="text-ui-fg-muted" />
                      </div>
                    )}
                    <div>
                      <Text size="small" weight="plus">{product.title}</Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">{product.handle}</Text>
                    </div>
                  </div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleAdd(product)}
                    disabled={saving === "add"}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <Text size="small" className="text-ui-fg-subtle">
              No products found, or all matching products are already added.
            </Text>
          )}
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : topSellers.length === 0 ? (
          <div className="py-8 text-center">
            <Star className="mx-auto mb-3 text-ui-fg-muted" />
            <Text className="text-ui-fg-subtle">No top sellers yet.</Text>
            <Text size="small" className="text-ui-fg-muted mt-1">
              Click "Add Product" to tag products as top sellers.
            </Text>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 pb-1 border-b border-ui-border-base">
              <Text size="xsmall" className="text-ui-fg-muted w-8 text-center">#</Text>
              <Text size="xsmall" className="text-ui-fg-muted flex-1">Product</Text>
              <Text size="xsmall" className="text-ui-fg-muted w-16 text-center">Active</Text>
              <Text size="xsmall" className="text-ui-fg-muted w-16 text-center">Order</Text>
              <Text size="xsmall" className="text-ui-fg-muted w-8 text-center">Remove</Text>
            </div>

            {topSellers.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ui-bg-base-hover transition-colors"
              >
                <Text size="small" className="text-ui-fg-muted w-8 text-center font-mono">
                  {item.sort_order}
                </Text>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.product?.thumbnail ? (
                    <img
                      src={item.product.thumbnail}
                      alt={item.product?.title}
                      className="w-12 h-12 object-cover rounded-md bg-ui-bg-subtle flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-ui-bg-subtle flex items-center justify-center flex-shrink-0">
                      <Star className="text-ui-fg-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Text size="small" weight="plus" className="truncate">
                      {item.product?.title ?? "Unknown Product"}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle truncate">
                      {item.product?.handle ?? item.product_id}
                    </Text>
                  </div>
                </div>

                <div className="w-16 flex justify-center">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={() => handleToggle(item)}
                    disabled={saving === item.id}
                  />
                </div>

                <div className="w-16 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || saving === "reorder"}
                    className="p-1 rounded hover:bg-ui-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUpMini />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === topSellers.length - 1 || saving === "reorder"}
                    className="p-1 rounded hover:bg-ui-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDownMini />
                  </button>
                </div>

                <div className="w-8 flex justify-center">
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={saving === item.id}
                    className="p-1 rounded hover:bg-ui-bg-subtle text-ui-fg-muted hover:text-ui-fg-error disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Remove from top sellers"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-ui-bg-subtle">
        <Text size="xsmall" className="text-ui-fg-muted">
          Only active top sellers are shown on the homepage. You can also toggle a product's top seller status from its product detail page.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Top Sellers",
  icon: Star,
})

export default TopSellersPage
