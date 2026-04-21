import { DEFAULT_CART_DROPDOWN_FIELDS } from "@/components/cart"
import ProductOptionSelect from "@/components/product-option-select"
import { useCartDrawer } from "@/lib/context/cart"
import { useCustomer } from "@/lib/context/customer"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { formatPrice, getDiscountPercentage, calculateStrikethroughPrice } from "@/lib/utils/price"
import { getVariantOptionsKeymap, isVariantInStock } from "@/lib/utils/product"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { sdk } from "@/lib/utils/sdk"
import { Minus, Plus } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { isEqual } from "lodash-es"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

const WHATSAPP_NUMBER = "918179135113"

const MOM_SIZES = ["Small", "Medium", "Large", "XXL"] as const
type MomSize = (typeof MOM_SIZES)[number]

const MOM_DAUGHTER_COMBO_HANDLE = "mother-daughter-combos"

/**
 * Gets the appropriate VTO image for a product.
 * Priority: 1) metadata.vto_image_url, 2) second image, 3) thumbnail
 */
const getVtoImageUrl = (product: HttpTypes.StoreProduct): string | undefined => {
  // 1. Check if custom VTO image is set in metadata
  if (product.metadata?.vto_image_url) {
    return product.metadata.vto_image_url as string
  }
  
  // 2. Use second image (index 1) if available
  if (product.images && product.images.length > 1) {
    return product.images[1].url
  }
  
  // 3. Use first image if only one exists
  if (product.images && product.images.length > 0) {
    return product.images[0].url
  }
  
  // 4. Fallback to thumbnail
  return product.thumbnail ?? undefined
}

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
};

const ProductActions = memo(function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | undefined>
  >({})
  const [quantity, setQuantity] = useState(1)
  const [momSize, setMomSize] = useState<MomSize>("Small")
  const [buyNowLoading, setBuyNowLoading] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const addToCartMutation = useAddToCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const { openCart } = useCartDrawer()

  const isMomDaughterCombo = useMemo(() => {
    return (product.categories ?? []).some(
      (cat: { handle: string }) => cat.handle === MOM_DAUGHTER_COMBO_HANDLE
    )
  }, [product.categories])

  useEffect(() => {
    setQuantity(1)
    setSizeError(false)
    const options = product?.options ?? []
    const defaultSelections: Record<string, string | undefined> = {}
    let hasDefault = false

    for (const option of options) {
      const values = (option.values ?? []).map((v) => v.value)
      const defaultValue = values.find((v) =>
        v.toLowerCase() === "0-3 months" || v.toLowerCase() === "0-3m"
      )
      if (defaultValue) {
        defaultSelections[option.id] = defaultValue
        hasDefault = true
      }
    }

    if (hasDefault) {
      setSelectedOptions(defaultSelections)
    } else {
      setSelectedOptions({})
    }
  }, [product?.handle, product?.options])

  useEffect(() => {
    const variants = product?.variants
    if (variants?.length === 1) {
      const firstVariant = variants[0]
      const optionsKeymap = getVariantOptionsKeymap(
        firstVariant?.options ?? []
      )
      setSelectedOptions(optionsKeymap ?? {})
    }
  }, [product?.variants])

  const selectedVariant = useMemo(() => {
    if (!product?.variants || product?.variants.length === 0) {
      return
    }

    if (
      product?.variants.length === 1 &&
      (!product?.options || product?.options.length === 0)
    ) {
      return product?.variants[0]
    }

    const variants = product?.variants
    if (!variants) return

    const variant = variants.find((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      return isEqual(optionsKeymap, selectedOptions)
    })

    return variant
  }, [product?.variants, product?.options, selectedOptions])

  const outOfStockMap = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    if (!product?.options || !product?.variants) return map

    for (const option of product.options) {
      const oosValues = new Set<string>()
      for (const optionValue of option.values ?? []) {
        const variantsWithValue = product.variants.filter((v) =>
          v.options?.some(
            (o) => o.option_id === option.id && o.value === optionValue.value
          )
        )
        const allOutOfStock =
          variantsWithValue.length > 0 &&
          variantsWithValue.every((v) => !isVariantInStock(v))
        if (allOutOfStock) {
          oosValues.add(optionValue.value)
        }
      }
      map[option.id] = oosValues
    }
    return map
  }, [product?.options, product?.variants])

  const setOptionValue = (optionId: string, value: string) => {
    setSizeError(false)
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product?.variants?.some((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      return isEqual(optionsKeymap, selectedOptions)
    })
  }, [product?.variants, selectedOptions])

  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    return isVariantInStock(selectedVariant)
  }, [selectedVariant])

  const hasOptions = (product.options?.length ?? 0) > 0

  // --- Price computation with correct discount calculation ---
  const priceInfo = useMemo(() => {
    const calcPrice = selectedVariant?.calculated_price
    const discountPercentage = getDiscountPercentage(product)
    
    if (!calcPrice?.calculated_amount || !calcPrice.currency_code) {
      // Fall back to cheapest variant
      const variantsWithPrice = (product.variants ?? []).filter(
        (v) => !!v.calculated_price?.calculated_amount
      )
      if (variantsWithPrice.length === 0) return null
      const cheapest = variantsWithPrice.sort(
        (a, b) =>
          (a.calculated_price!.calculated_amount ?? 0) -
          (b.calculated_price!.calculated_amount ?? 0)
      )[0]
      const amount = cheapest.calculated_price!.calculated_amount!
      const currency = cheapest.calculated_price!.currency_code!
      const strikethroughAmount = calculateStrikethroughPrice(amount, discountPercentage)
      
      return {
        realAmount: amount,
        strikethroughAmount,
        realFormatted: formatPrice({ amount, currency_code: currency }),
        strikethroughFormatted: strikethroughAmount 
          ? formatPrice({ amount: strikethroughAmount, currency_code: currency })
          : null,
        discountPercentage,
      }
    }
    const amount = calcPrice.calculated_amount
    const currency = calcPrice.currency_code
    const strikethroughAmount = calculateStrikethroughPrice(amount, discountPercentage)
    
    return {
      realAmount: amount,
      strikethroughAmount,
      realFormatted: formatPrice({ amount, currency_code: currency }),
      strikethroughFormatted: strikethroughAmount
        ? formatPrice({ amount: strikethroughAmount, currency_code: currency })
        : null,
      discountPercentage,
    }
  }, [selectedVariant, product.variants, product.metadata])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      if (hasOptions) setSizeError(true)
      return null
    }

    addToCartMutation.mutateAsync(
      {
        variant_id: selectedVariant.id,
        quantity,
        country_code: countryCode,
        product,
        variant: selectedVariant,
        region,
        metadata: isMomDaughterCombo ? { mom_size: momSize } : undefined,
      },
      {
        onSuccess: () => {
          openCart()
        },
      }
    )
  }

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      if (hasOptions) setSizeError(true)
      return
    }

    setBuyNowLoading(true)
    try {
      await addToCartMutation.mutateAsync({
        variant_id: selectedVariant.id,
        quantity,
        country_code: countryCode,
        product,
        variant: selectedVariant,
        region,
        metadata: isMomDaughterCombo ? { mom_size: momSize } : undefined,
      })
      navigate({
        to: "/$countryCode/checkout",
        params: { countryCode },
        search: { step: "addresses" },
      })
    } catch {
      // error handled by mutation
    } finally {
      setBuyNowLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-5">
      {/* MRP Pricing Block — stock status inline after discount badge */}
      {priceInfo && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-serif text-2xl font-bold text-[var(--color-text)]">
            {priceInfo.realFormatted}
          </span>
          {priceInfo.strikethroughFormatted && (
            <span className="text-sm text-gray-400 line-through">
              {priceInfo.strikethroughFormatted}
            </span>
          )}
          {priceInfo.discountPercentage > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              {priceInfo.discountPercentage}% OFF
            </span>
          )}
          {selectedVariant && inStock && (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          )}
          {selectedVariant && !inStock && (
            <span className="text-xs text-red-500 font-medium">Currently Unavailable</span>
          )}
        </div>
      )}

      {hasOptions && (
        <div className="flex flex-col gap-y-5">
          {(product.options || []).map((option) => (
            <ProductOptionSelect
              key={option.id}
              option={option}
              current={selectedOptions[option.id]}
              updateOption={setOptionValue}
              title={option.title ?? ""}
              data-testid="product-options"
              disabled={!!disabled || addToCartMutation.isPending}
              outOfStockValues={outOfStockMap[option.id]}
            />
          ))}
          {sizeError && (
            <p className="text-xs text-red-500 font-medium -mt-2">
              Please select a size before continuing.
            </p>
          )}
        </div>
      )}

      {/* Mom Size Selector — only for Mother & Daughter Combo products */}
      {isMomDaughterCombo && (
        <div className="flex flex-col gap-y-2">
          <span className="text-sm font-medium text-[var(--color-text)]">
            Mom&apos;s Size
          </span>
          <div className="flex flex-wrap gap-2">
            {MOM_SIZES.map((size) => {
              const isMomSizeDisabled = !!disabled || addToCartMutation.isPending || !inStock
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setMomSize(size)}
                  disabled={isMomSizeDisabled}
                  className={[
                    "px-4 py-1.5 rounded-full border text-sm font-medium transition-colors",
                    momSize === size
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                      : "bg-white border-gray-200 text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                    isMomSizeDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex flex-col gap-y-2">
        <span className="text-sm font-medium text-[var(--color-text)]">Choose Quantity</span>
        <div className="flex items-center gap-0 border border-gray-200 rounded-md w-fit">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-md"
          >
            <Minus />
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-[var(--color-text)] border-x border-gray-200">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] hover:bg-gray-50 transition-colors rounded-r-md"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* Add to Bag + Buy Now — side by side */}
      <div className="flex gap-3">
        {/* Add to Bag — ghost/outline */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || !isValidVariant || addToCartMutation.isPending || buyNowLoading}
          data-testid="add-product-button"
          className={[
            "flex-1 h-12 rounded-full text-base font-semibold tracking-wide transition-all",
            "border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent",
            "hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-light)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {addToCartMutation.isPending && !buyNowLoading
            ? "Adding..."
            : !inStock || !isValidVariant
              ? "Out of Stock"
              : "Add to Bag"}
        </button>

        {/* Buy Now — solid dark rose */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock || !!disabled || buyNowLoading || addToCartMutation.isPending}
          className={[
            "flex-1 h-12 rounded-full text-base font-semibold tracking-wide text-white transition-all",
            "bg-[#750A27] hover:bg-[#8f0e30] active:bg-[#5e0820]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-sm hover:shadow-md",
          ].join(" ")}
        >
          {buyNowLoading ? "Redirecting..." : "Buy Now"}
        </button>
      </div>

      <TryMeSection product={product} countryCode={countryCode} />
    </div>
  )
})

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────

const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.523 5.836L0 24l6.336-1.495A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.36-.213-3.757.886.939-3.658-.234-.376A9.818 9.818 0 1112 21.818z" />
  </svg>
)

// ─── Try Me Section ───────────────────────────────────────────────────────────

type TryMeSectionProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type TryMeVtoStatus = "idle" | "uploading" | "submitting" | "processing" | "completed" | "failed" | "timed_out"

const TryMeSection = ({ product, countryCode }: TryMeSectionProps) => {
  const { isAuthenticated } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()

  const productUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://fairyfrills.in/${countryCode}/products/${product.handle}`
  const waMessage = encodeURIComponent(
    `Hey Team, does this product come in a customizable option?\n\nProduct: *${product.title}*\n${productUrl}`
  )

  const [showUpload, setShowUpload] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [popupOpen, setPopupOpen] = useState(false)
  const [vtoStatus, setVtoStatus] = useState<TryMeVtoStatus>("idle")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [vtoError, setVtoError] = useState<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    pollCountRef.current = 0
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop())
    }
  }, [stopPolling, cameraStream])

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      setCameraStream(stream)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setUploadError("Could not access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
      closeCam()
      setUploadError(null)
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }, "image/jpeg", 0.9)
  }

  const closeCam = () => {
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    setShowCamera(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPG, PNG, and GIF files are allowed.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB.")
      return
    }
    setUploadError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    e.target.value = ""
  }

  const handleTryNow = async () => {
    if (!photoFile) return

    const productImage = getVtoImageUrl(product)
    if (!productImage) {
      setVtoError("This product has no image for virtual try-on.")
      setPopupOpen(true)
      return
    }

    if (!isAuthenticated) {
      navigate({
        to: "/$countryCode/account/login",
        params: { countryCode },
        search: { redirect: location.pathname },
      })
      return
    }

    setPopupOpen(true)
    setVtoStatus("uploading")
    setResultImageUrl(null)
    setVtoError(null)

    try {
      const formData = new FormData()
      formData.append("files", photoFile)

      const backendUrl =
        (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_MEDUSA_BACKEND_URL?: string } }).env?.VITE_MEDUSA_BACKEND_URL) ||
        "http://localhost:9000"
      const publishableKey =
        (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_MEDUSA_PUBLISHABLE_KEY?: string } }).env?.VITE_MEDUSA_PUBLISHABLE_KEY) || ""

      const token = await (sdk.client as unknown as { getToken(): Promise<string | null> }).getToken()
      const headers: Record<string, string> = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      if (publishableKey) headers["x-publishable-api-key"] = publishableKey

      const uploadRes = await fetch(`${backendUrl}/store/vto/upload-photo`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json() as { photo_url: string }
      const uploadedPhotoUrl = uploadData.photo_url

      setVtoStatus("submitting")
      const submitData = await sdk.client.fetch<{ task_id: string; session_id: string }>("/store/vto/submit", {
        method: "POST",
        body: {
          model_photo_url: uploadedPhotoUrl,
          product_image_url: productImage,
          product_id: product.id,
          garment_type: (product as { metadata?: { garment_type?: string } }).metadata?.garment_type || "dress",
        },
      })

      setVtoStatus("processing")
      stopPolling()
      pollCountRef.current = 0

      pollIntervalRef.current = setInterval(async () => {
        pollCountRef.current += 1
        if (pollCountRef.current > 40) {
          stopPolling()
          setVtoStatus("timed_out")
          setVtoError("Try-on timed out after 2 minutes. Please try again.")
          return
        }
        try {
          const pollData = await sdk.client.fetch<{
            status: string
            result_image_url?: string
            error?: string
          }>(`/store/vto/status?task_id=${encodeURIComponent(submitData.task_id)}&session_id=${encodeURIComponent(submitData.session_id)}`)

          if (pollData.status === "completed" && pollData.result_image_url) {
            stopPolling()
            setResultImageUrl(pollData.result_image_url)
            setVtoStatus("completed")
          } else if (pollData.status === "failed") {
            stopPolling()
            setVtoError(pollData.error || "Try-on failed. Please try a different photo.")
            setVtoStatus("failed")
          }
        } catch {
          // keep polling
        }
      }, 3000)
    } catch {
      setVtoStatus("failed")
      setVtoError("Something went wrong. Please try again.")
    }
  }

  const handleClosePopup = () => {
    stopPolling()
    setPopupOpen(false)
    setVtoStatus("idle")
    setResultImageUrl(null)
    setVtoError(null)
  }

  const handleDownload = () => {
    if (!resultImageUrl) return
    const link = document.createElement("a")
    link.href = resultImageUrl
    link.download = `fairyfrills-tryon-${Date.now()}.jpg`
    link.click()
  }

  const isProcessing = vtoStatus === "uploading" || vtoStatus === "submitting" || vtoStatus === "processing"

  return (
    <>
      <div className="flex gap-2">
        {/* Virtual Try-On button — 1/3 width */}
        <button
          type="button"
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center justify-center gap-1.5 w-1/3 h-9 px-2 rounded-full text-xs font-semibold text-white transition-all shadow-sm hover:shadow-md shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="hidden xs:inline">Virtual Try-On</span>
          <span className="inline xs:hidden">Try Now</span>
        </button>

        {/* Customize Dress — 2/3 width */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-full text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
          style={{ background: "#E799AA" }}
        >
          <WhatsAppSVG />
          Customize Dress
        </a>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div
          className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: "#fdf2f5", borderColor: "#f0dde2" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#7a6068" }}>
            Upload your photo to try this dress on you
          </p>

          {photoPreview ? (
            <div className="flex items-center gap-3">
              <img
                src={photoPreview}
                alt="Your photo"
                className="w-14 h-14 rounded-xl object-cover border"
                style={{ borderColor: "#f0dde2" }}
              />
              <div className="flex flex-col gap-1.5 flex-1">
                <p className="text-xs font-medium" style={{ color: "#2d2d2d" }}>Photo selected</p>
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="text-xs underline text-left"
                  style={{ color: "#9c8589" }}
                >
                  Change photo
                </button>
              </div>
              <button
                type="button"
                onClick={handleTryNow}
                disabled={!photoFile}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Try Now
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-3 w-full py-4 rounded-xl border-2 border-dashed"
              style={{ borderColor: "#E799AA", background: "white" }}
            >
              <p className="text-xs font-medium" style={{ color: "#9c8589" }}>
                Choose how you want to add your photo
              </p>
              <div className="flex gap-2 w-full px-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#E799AA" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
                  style={{ borderColor: "#f0dde2", color: "#7a6068", background: "white" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Use Camera
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs" style={{ color: "#e11d48" }}>{uploadError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* VTO Result Popup — rendered via portal at document.body to escape any overflow:hidden parent */}
      {popupOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 99999 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClosePopup() }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl shadow-2xl flex flex-col"
            style={{ background: "white", maxHeight: "88vh", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: "#f0dde2" }}>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E799AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="font-semibold text-sm" style={{ color: "#2d2d2d" }}>Virtual Try-On</span>
              </div>
              <button
                type="button"
                onClick={handleClosePopup}
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold transition-colors hover:bg-gray-100 text-gray-400"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-4">
              {isProcessing && (
                <div className="flex flex-col items-center gap-4 py-6 w-full">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #fdf2f5, #f9e0e8)" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E799AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 2s linear infinite" }}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "#2d2d2d" }}>
                      {vtoStatus === "uploading" && "Uploading your photo..."}
                      {vtoStatus === "submitting" && "Preparing your try-on..."}
                      {vtoStatus === "processing" && "AI is styling you..."}
                    </p>
                    <p className="text-xs" style={{ color: "#9c8589" }}>This takes about 30~60 seconds</p>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#E799AA", animation: `tryme-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 w-full mt-2">
                    <div className="flex-1 rounded-2xl overflow-hidden border" style={{ aspectRatio: "3/4", borderColor: "#f0dde2" }}>
                      {photoPreview
                        ? <img src={photoPreview} alt="Your photo" className="w-full h-full object-cover" />
                        : <div className="w-full h-full" style={{ background: "#fdf2f5" }} />
                      }
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border" style={{ aspectRatio: "3/4", borderColor: "#f0dde2", background: "#fdf2f5" }}>
                      {product.thumbnail && <img src={product.thumbnail} alt={product.title ?? ""} className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
              )}

              {vtoStatus === "completed" && resultImageUrl && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#F0FFF4", color: "#16a34a" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Try-on complete
                  </div>
                  <div className="w-full rounded-2xl overflow-hidden shadow-md">
                    <img src={resultImageUrl} alt="Virtual try-on result" className="w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Save Photo
                  </button>
                </div>
              )}

              {(vtoStatus === "failed" || vtoStatus === "timed_out") && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#fff0f3" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#2d2d2d" }}>{vtoError || "Something went wrong"}</p>
                  <button
                    type="button"
                    onClick={() => { setVtoStatus("idle"); setVtoError(null); setResultImageUrl(null); setPopupOpen(false) }}
                    className="text-sm font-semibold underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2 shrink-0">
              <button
                type="button"
                onClick={handleClosePopup}
                className="w-full h-10 rounded-full border text-sm font-semibold hover:bg-gray-50"
                style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Camera Modal — rendered via portal */}
      {showCamera && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 100000 }}
        >
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "#2d2d2d" }}>
              Take a Photo
            </h3>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "3/4", maxHeight: 340 }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCam}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                style={{ borderColor: "#f0dde2", color: "#7a6068" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#E799AA" }}
              >
                Capture
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes tryme-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </>
  )
}

export default ProductActions
