import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text, Switch, Input, Button, Badge, Select, Label } from "@medusajs/ui"
import { Star } from "@medusajs/icons"
import { sdk } from "../lib/client"
import { useState, useEffect, useCallback } from "react"

enum BadgeType {
  NEW = "NEW",
  EXCLUSIVE = "EXCLUSIVE",
  TRENDING = "TRENDING",
  BESTSELLER = "BESTSELLER",
  VIRAL = "VIRAL",
  HOT = "HOT",
  LIMITED_EDITION = "LIMITED_EDITION",
  SOLD_OUT = "SOLD_OUT",
}

type TopSellerData = {
  id: string
  product_id: string
  sort_order: number
  is_active: boolean
  badge_type: BadgeType | null
  badge_visible: boolean
  compare_at_price: number | null
}

const TopSellerWidget = ({ data: product }: DetailWidgetProps<any>) => {
  const [topSeller, setTopSeller] = useState<TopSellerData | null>(null)
  const [isTopSeller, setIsTopSeller] = useState(false)
  const [sortOrder, setSortOrder] = useState(0)
  const [badgeType, setBadgeType] = useState<BadgeType | null>(null)
  const [badgeVisible, setBadgeVisible] = useState(true)
  const [compareAtPrice, setCompareAtPrice] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const data = await sdk.client.fetch<{ top_sellers: TopSellerData[] }>("/admin/top-sellers")
      const match = data.top_sellers.find((ts) => ts.product_id === product.id)
      if (match) {
        setTopSeller(match)
        setIsTopSeller(match.is_active ?? false)
        setSortOrder(match.sort_order ?? 0)
        // Defensive: handle old cached data missing new badge fields
        setBadgeType(match.badge_type !== undefined ? match.badge_type : null)
        setBadgeVisible(match.badge_visible !== undefined ? match.badge_visible : true)
        setCompareAtPrice(match.compare_at_price !== undefined && match.compare_at_price !== null ? String(match.compare_at_price) : "")
      } else {
        setTopSeller(null)
        setIsTopSeller(false)
        setSortOrder(0)
        setBadgeType(null)
        setBadgeVisible(true)
        setCompareAtPrice("")
      }
    } catch (e) {
      console.error("Failed to fetch top seller data", e)
      // Reset to safe defaults on error
      setTopSeller(null)
      setIsTopSeller(false)
    } finally {
      setLoading(false)
    }
  }, [product.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggle = async (checked: boolean) => {
    setSaving(true)
    try {
      if (topSeller) {
        await sdk.client.fetch(`/admin/top-sellers/${topSeller.id}`, {
          method: "POST",
          body: { is_active: checked },
        })
      } else if (checked) {
        await sdk.client.fetch("/admin/top-sellers", {
          method: "POST",
          body: { 
            product_id: product.id, 
            sort_order: sortOrder, 
            is_active: true,
            badge_type: badgeType,
            badge_visible: badgeVisible,
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
          },
        })
      }
      setIsTopSeller(checked)
      await fetchData()
    } catch (e) {
      console.error("Failed to toggle top seller", e)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!topSeller) return
    setSaving(true)
    try {
      await sdk.client.fetch(`/admin/top-sellers/${topSeller.id}`, {
        method: "POST",
        body: { 
          sort_order: sortOrder,
          badge_type: badgeType,
          badge_visible: badgeVisible,
          compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        },
      })
      await fetchData()
    } catch (e) {
      console.error("Failed to update top seller", e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Star />
          <Heading level="h2">Top Seller</Heading>
        </div>
        {isTopSeller && (
          <Badge size="2xsmall" color="green">Active</Badge>
        )}
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Text size="small" weight="plus">Is Top Seller</Text>
            <Text size="small" className="text-ui-fg-subtle">
              Display this product in the Top Sellers section on the homepage
            </Text>
          </div>
          <Switch
            checked={isTopSeller}
            onCheckedChange={handleToggle}
            disabled={saving}
          />
        </div>
        {isTopSeller && (
          <>
            <div className="flex items-end gap-x-3">
              <div className="flex-1">
                <Text size="small" weight="plus" className="mb-1.5">Sort Order</Text>
                <Input
                  type="number"
                  size="small"
                  value={String(sortOrder)}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div>
              <Text size="small" weight="plus" className="mb-1.5">Badge Type</Text>
              <Select
                value={badgeType || "none"}
                onValueChange={(value) => setBadgeType(value === "none" ? null : value as BadgeType)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="No Badge" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">No Badge</Select.Item>
                  <Select.Item value="NEW">NEW (Pink)</Select.Item>
                  <Select.Item value="EXCLUSIVE">EXCLUSIVE (Deep Rose)</Select.Item>
                  <Select.Item value="TRENDING">TRENDING (Purple)</Select.Item>
                  <Select.Item value="BESTSELLER">BESTSELLER (Gold)</Select.Item>
                  <Select.Item value="VIRAL">VIRAL (Orange)</Select.Item>
                  <Select.Item value="HOT">HOT (Red)</Select.Item>
                  <Select.Item value="LIMITED_EDITION">LIMITED EDITION (Maroon)</Select.Item>
                  <Select.Item value="SOLD_OUT">SOLD OUT (Gray)</Select.Item>
                </Select.Content>
              </Select>
            </div>

            {badgeType && (
              <div className="flex items-center justify-between">
                <div>
                  <Text size="small" weight="plus">Show Badge</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Display the badge on the product card
                  </Text>
                </div>
                <Switch
                  checked={badgeVisible}
                  onCheckedChange={setBadgeVisible}
                />
              </div>
            )}

            <div>
              <Text size="small" weight="plus" className="mb-1.5">Compare At Price (Original Price)</Text>
              <Input
                type="number"
                size="small"
                placeholder="Optional - for showing discount"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
              <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                Set an original price to show discount percentage
              </Text>
            </div>

            {topSeller && (
              <Button
                size="small"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                Save All Changes
              </Button>
            )}
            
            {!topSeller && (
              <Text size="xsmall" className="text-ui-fg-subtle text-center">
                Save the product to apply these settings
              </Text>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default TopSellerWidget
