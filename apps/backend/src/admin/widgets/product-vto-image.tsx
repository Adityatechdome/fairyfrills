import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Container,
  Heading,
  Button,
  Tooltip,
  toast,
  Badge,
} from "@medusajs/ui"
import { useState } from "react"
import { CheckCircleSolid } from "@medusajs/icons"

const ProductVtoImageWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const product = data
  const [updating, setUpdating] = useState(false)

  // Get current VTO image URL from metadata
  const currentVtoImageUrl = product.metadata?.vto_image_url as string | undefined

  // Get product images
  const productImages = product.images || []

  // Default: second image (index 1) or first image if only one exists
  const defaultVtoImage = productImages.length > 1 
    ? productImages[1].url 
    : productImages.length > 0 
    ? productImages[0].url 
    : null

  const handleSetVtoImage = async (imageUrl: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            vto_image_url: imageUrl,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update VTO image")
      }

      toast.success("Success", {
        description: "VTO image set successfully",
      })
      
      // Reload page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error setting VTO image:", error)
      toast.error("Error", {
        description: "Failed to set VTO image",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleClearVtoImage = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            vto_image_url: null,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to clear VTO image")
      }

      toast.success("Success", {
        description: "VTO image cleared successfully",
      })
      
      // Reload page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error clearing VTO image:", error)
      toast.error("Error", {
        description: "Failed to clear VTO image",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (!productImages.length) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Virtual Try-On Image</Heading>
            <p className="text-ui-fg-subtle text-sm mt-1">
              No images available. Add product images first.
            </p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level="h2">Virtual Try-On Image</Heading>
            <p className="text-ui-fg-subtle text-sm mt-1">
              Select which image to use for Virtual Try-On. Default: second image or first if only one exists.
            </p>
          </div>
          {currentVtoImageUrl && (
            <Button
              size="small"
              variant="secondary"
              onClick={handleClearVtoImage}
              disabled={updating}
            >
              Use Default
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productImages.map((image, index) => {
            const isCurrentVto = currentVtoImageUrl === image.url
            const isDefaultVto = !currentVtoImageUrl && image.url === defaultVtoImage

            return (
              <div key={image.id} className="relative">
                <div
                  className={`relative rounded-lg overflow-hidden border-2 ${
                    isCurrentVto || isDefaultVto
                      ? "border-green-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  {(isCurrentVto || isDefaultVto) && (
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                      <CheckCircleSolid className="text-white w-4 h-4" />
                    </div>
                  )}
                  {isDefaultVto && !isCurrentVto && (
                    <div className="absolute bottom-1 left-1">
                      <Badge size="small" color="green">
                        Default
                      </Badge>
                    </div>
                  )}
                  {image.url === product.thumbnail && (
                    <div className="absolute top-1 left-1">
                      <Badge size="small" color="blue">
                        Thumbnail
                      </Badge>
                    </div>
                  )}
                </div>
                <Tooltip content={isCurrentVto ? "Current VTO Image" : "Set as VTO Image"}>
                  <Button
                    size="small"
                    variant={isCurrentVto ? "primary" : "secondary"}
                    className="mt-2 w-full"
                    onClick={() => handleSetVtoImage(image.url)}
                    disabled={updating || isCurrentVto}
                  >
                    {isCurrentVto ? "VTO Image" : "Make VTO Image"}
                  </Button>
                </Tooltip>
              </div>
            )
          })}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVtoImageWidget
