import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Text, Input, Button, Badge } from "@medusajs/ui"
import { Tag } from "@medusajs/icons"
import { sdk } from "../lib/client"
import { useState, useEffect } from "react"

const ProductDiscountWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const [discountPercentage, setDiscountPercentage] = useState<number>(50)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Read discount from product metadata, default to 50%
    const metadataDiscount = product.metadata?.discount_percentage
    if (metadataDiscount && typeof metadataDiscount === 'number') {
      setDiscountPercentage(metadataDiscount)
    } else if (metadataDiscount && typeof metadataDiscount === 'string') {
      const parsed = parseFloat(metadataDiscount)
      if (!isNaN(parsed)) {
        setDiscountPercentage(parsed)
      }
    }
  }, [product.metadata])

  const handleSave = async () => {
    setError(null)
    
    // Validate discount percentage
    if (discountPercentage < 0 || discountPercentage > 100) {
      setError("Discount must be between 0% and 100%")
      return
    }

    setSaving(true)
    try {
      await sdk.admin.product.update(product.id, {
        metadata: {
          ...product.metadata,
          discount_percentage: discountPercentage,
        },
      })
      
      // Success - metadata updated
      setError(null)
    } catch (e) {
      console.error("Failed to update discount", e)
      setError("Failed to save discount percentage")
    } finally {
      setSaving(false)
    }
  }

  const currentMetadataDiscount = product.metadata?.discount_percentage
  const hasChanged = currentMetadataDiscount !== discountPercentage
  
  // Display the current discount value from metadata
  const displayDiscount = (() => {
    if (currentMetadataDiscount === undefined) return null
    if (typeof currentMetadataDiscount === 'number') return currentMetadataDiscount
    if (typeof currentMetadataDiscount === 'string') {
      const parsed = parseFloat(currentMetadataDiscount)
      return !isNaN(parsed) ? parsed : null
    }
    return null
  })()

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Tag />
          <Heading level="h2">Discount Percentage</Heading>
        </div>
        {displayDiscount !== null && (
          <Badge size="2xsmall" color="purple">
            {displayDiscount}% OFF
          </Badge>
        )}
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <Text size="small" className="text-ui-fg-subtle mb-3">
            Set the discount percentage for this product. This will be displayed on the storefront as a badge.
            Default is 50% if not set.
          </Text>
          <div className="flex items-end gap-x-3">
            <div className="flex-1">
              <Text size="small" weight="plus" className="mb-1.5">
                Discount %
              </Text>
              <Input
                type="number"
                size="small"
                min="0"
                max="100"
                value={String(discountPercentage)}
                onChange={(e) => {
                  const val = e.target.value
                  setDiscountPercentage(val === '' ? 0 : Number(val))
                  setError(null)
                }}
              />
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={handleSave}
              disabled={saving || !hasChanged}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && (
            <Text size="small" className="text-red-600 mt-2">
              {error}
            </Text>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDiscountWidget
