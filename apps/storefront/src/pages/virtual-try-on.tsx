import { useCustomer } from "@/lib/context/customer"
import { sdk } from "@/lib/utils/sdk"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type VtoStatus = "idle" | "uploading" | "submitting" | "processing" | "completed" | "failed" | "timed_out"

type HistorySession = {
  id: string
  product_id?: string
  model_photo_url: string
  product_image_url: string
  result_image_url?: string
  status: "pending" | "processing" | "completed" | "failed" | "timed_out" | "abandoned"
  saved: boolean
  created_at: string
  completed_at?: string
}

type Product = {
  id: string
  title: string
  thumbnail?: string
  handle: string
  variants?: { calculated_price?: { calculated_amount?: number }; prices?: { amount: number; currency_code: string }[] }[]
  metadata?: { garment_type?: "upper" | "lower" | "dress"; vto_image_url?: string }
  images?: { id: string; url: string }[]
}

// ─── Helper: Get VTO Image ──────────────────────────────────────────────────

/**
 * Gets the appropriate VTO image for a product.
 * Priority: 1) metadata.vto_image_url, 2) second image, 3) thumbnail
 */
const getVtoImageUrl = (product: Product): string => {
  // 1. Check if custom VTO image is set in metadata
  if (product.metadata?.vto_image_url) {
    return product.metadata.vto_image_url
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
  return product.thumbnail || ""
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.73 12.73.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7m12.73-12.73.7-.7" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: HistorySession["status"] }) => {
  const config = {
    completed: { label: "Done", bg: "#F0FFF4", color: "#16a34a" },
    processing: { label: "Processing", bg: "#FFF7ED", color: "#d97706" },
    pending: { label: "Pending", bg: "#EFF6FF", color: "#2563eb" },
    failed: { label: "Failed", bg: "#FFF1F2", color: "#e11d48" },
    timed_out: { label: "Timed out", bg: "#F5F3FF", color: "#7c3aed" },
    abandoned: { label: "Abandoned", bg: "#F9FAFB", color: "#6b7280" },
  }[status] || { label: status, bg: "#F9FAFB", color: "#6b7280" }

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = ({ size = 20 }: { size?: number }) => (
  <span
    className="inline-block rounded-full border-2 border-t-transparent"
    style={{
      width: size,
      height: size,
      borderColor: "#E799AA",
      borderTopColor: "transparent",
      animation: "spin 0.7s linear infinite",
    }}
  />
)

// ─── Main Component ───────────────────────────────────────────────────────────

const VirtualTryOnPage = () => {
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  // Photo upload state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // Product selection state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // VTO state
  const [vtoStatus, setVtoStatus] = useState<VtoStatus>("idle")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [vtoError, setVtoError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)

  // History (kept for API calls but section removed from UI)
  const [history, setHistory] = useState<HistorySession[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [clearingHistory, setClearingHistory] = useState(false)

  // ─── Auth redirect ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({
        to: "/$countryCode/account/login",
        params: { countryCode },
        search: { redirect: location.pathname },
      })
    }
  }, [authLoading, isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load products ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return
    ;(async () => {
      try {
        const { products: p } = await sdk.store.product.list({
          limit: 500,
          fields: "id,title,thumbnail,handle,metadata,variants,*images",
        } as Parameters<typeof sdk.store.product.list>[0])
        setProducts(p as unknown as Product[])
      } catch {
        // silently fail — empty product list is fine
      } finally {
        setProductsLoading(false)
      }
    })()
  }, [isAuthenticated])

  // ─── Load history ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return
    loadHistory()
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = async () => {
    try {
      const data = await sdk.client.fetch<{ sessions: HistorySession[] }>("/store/vto/history")
      setHistory(data.sessions || [])
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false)
    }
  }

  // ─── Poll cleanup ───────────────────────────────────────────────────────────

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
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stopPolling, cameraStream])

  // ─── Cancel in-flight when new selection is made ────────────────────────────

  const cancelInFlight = useCallback(async () => {
    if (pollIntervalRef.current && currentSessionId) {
      stopPolling()
      try {
        await sdk.client.fetch("/store/vto/save", {
          method: "POST",
          body: { session_id: currentSessionId, saved: false },
        })
      } catch {
        // best-effort
      }
    }
  }, [currentSessionId, stopPolling])

  // ─── File validation ─────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowed.includes(file.type)) return "Only JPG, PNG, and GIF files are allowed."
    if (file.size > 10 * 1024 * 1024) return "File must be under 10MB."
    return null
  }

  // ─── Upload photo ────────────────────────────────────────────────────────────

  const uploadPhoto = async (file: File) => {
    const err = validateFile(file)
    if (err) {
      setUploadError(err)
      return
    }

    setUploadError(null)
    setVtoStatus("uploading")
    await cancelInFlight()
    setVtoStatus("uploading")
    setResultImageUrl(null)
    setVtoError(null)
    setIsSaved(false)

    try {
      const formData = new FormData()
      formData.append("files", file)

      const backendUrl =
        (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_MEDUSA_BACKEND_URL?: string } }).env?.VITE_MEDUSA_BACKEND_URL) ||
        "http://localhost:9000"

      const publishableKey =
        (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_MEDUSA_PUBLISHABLE_KEY?: string } }).env?.VITE_MEDUSA_PUBLISHABLE_KEY) || ""

      // Use SDK's built-in getToken() to retrieve the JWT
      const token = await (sdk.client as unknown as { getToken(): Promise<string | null> }).getToken()
      const headers: Record<string, string> = {}
      if (token) headers["Authorization"] = `Bearer ${token}`
      if (publishableKey) headers["x-publishable-api-key"] = publishableKey

      const res = await fetch(`${backendUrl}/store/vto/upload-photo`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (res.status === 401) {
        navigate({ to: "/$countryCode/account/login", params: { countryCode }, search: { redirect: location.pathname } })
        return
      }

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json() as { photo_url: string }
      setPhotoUrl(data.photo_url)
      setVtoStatus("idle")
    } catch {
      setUploadError("We couldn't upload your photo. Please try again.")
      setVtoStatus("idle")
    }
  }

  // ─── Drag and drop ───────────────────────────────────────────────────────────

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadPhoto(file)
  }

  // ─── Camera ──────────────────────────────────────────────────────────────────

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
      uploadPhoto(file)
    }, "image/jpeg", 0.9)
  }

  const closeCam = () => {
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    setShowCamera(false)
  }

  // ─── Submit VTO ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!photoUrl || !selectedProduct) return

    await cancelInFlight()
    setVtoStatus("submitting")
    setResultImageUrl(null)
    setVtoError(null)
    setIsSaved(false)

    const productImage = getVtoImageUrl(selectedProduct)
    if (!productImage) {
      setVtoError("Selected product has no image.")
      setVtoStatus("failed")
      return
    }

    const garmentType = selectedProduct.metadata?.garment_type || "dress"

    try {
      const data = await sdk.client.fetch<{ task_id: string; session_id: string }>("/store/vto/submit", {
        method: "POST",
        body: {
          model_photo_url: photoUrl,
          product_image_url: productImage,
          product_id: selectedProduct.id,
          garment_type: garmentType,
        },
      })

      setCurrentTaskId(data.task_id)
      setCurrentSessionId(data.session_id)
      setVtoStatus("processing")
      startPolling(data.task_id, data.session_id)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401) {
        navigate({ to: "/$countryCode/account/login", params: { countryCode }, search: { redirect: location.pathname } })
        return
      }
      setVtoError("Try-on failed. Please try a different photo or outfit.")
      setVtoStatus("failed")
    }
  }

  // ─── Polling ──────────────────────────────────────────────────────────────────

  const startPolling = (taskId: string, sessionId: string) => {
    stopPolling()
    pollCountRef.current = 0

    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current += 1

      if (pollCountRef.current > 40) {
        stopPolling()
        // update session to timed_out
        try {
          await sdk.client.fetch("/store/vto/status", {
            method: "GET",
            query: { task_id: taskId, session_id: sessionId },
          } as Parameters<typeof sdk.client.fetch>[1])
        } catch {
          // ignore
        }
        setVtoStatus("timed_out")
        setVtoError("Try-on timed out after 2 minutes. Please try again.")
        loadHistory()
        return
      }

      try {
        const data = await sdk.client.fetch<{
          status: string
          result_image_url?: string
          error?: string
        }>(`/store/vto/status?task_id=${encodeURIComponent(taskId)}&session_id=${encodeURIComponent(sessionId)}`)

        if (data.status === "completed" && data.result_image_url) {
          stopPolling()
          setResultImageUrl(data.result_image_url)
          setVtoStatus("completed")
          loadHistory()
        } else if (data.status === "failed") {
          stopPolling()
          setVtoError(data.error || "Try-on failed. Please try a different photo or outfit.")
          setVtoStatus("failed")
          loadHistory()
        }
        // else still processing — continue polling
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 401) {
          stopPolling()
          navigate({ to: "/$countryCode/account/login", params: { countryCode }, search: { redirect: location.pathname } })
        }
        // other errors — keep polling
      }
    }, 3000)
  }

  // ─── Save result ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!currentSessionId) return
    try {
      await sdk.client.fetch("/store/vto/save", {
        method: "POST",
        body: { session_id: currentSessionId, saved: true },
      })
      setIsSaved(true)
    } catch {
      // silent
    }
  }

  // ─── Download result ──────────────────────────────────────────────────────────

  const handleDownload = () => {
    if (!resultImageUrl) return
    const link = document.createElement("a")
    link.href = resultImageUrl
    link.download = `fairyfrills-tryon-${Date.now()}.jpg`
    link.click()
  }

  // ─── Clear history ─────────────────────────────────────────────────────────────

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all try-on history?")) return
    setClearingHistory(true)
    try {
      await sdk.client.fetch("/store/vto/history", { method: "DELETE" })
      setHistory([])
    } catch {
      // silent
    } finally {
      setClearingHistory(false)
    }
  }

  // ─── Retry ─────────────────────────────────────────────────────────────────────

  const handleRetry = () => {
    setVtoStatus("idle")
    setVtoError(null)
    setResultImageUrl(null)
  }

  // ─── Auth loading ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // redirect handled by effect
  }

  const canSubmit = !!photoUrl && !!selectedProduct && vtoStatus !== "submitting" && vtoStatus !== "processing" && vtoStatus !== "uploading"

  // ─── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#fdf0f3" }}>
      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Upload Photo Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#E799AA" }}
                />
                <h2 className="font-semibold text-sm" style={{ color: "#2d2d2d" }}>
                  Upload Your Photo
                </h2>
              </div>

              {photoUrl ? (
                <div className="relative">
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ aspectRatio: "3/4", maxHeight: 200 }}
                  >
                    <img
                      src={photoUrl}
                      alt="Your uploaded photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPhotoUrl(null)
                      cancelInFlight()
                      setVtoStatus("idle")
                      setResultImageUrl(null)
                      setVtoError(null)
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ color: "#888" }}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                  <div
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg w-fit"
                    style={{ background: "#F0FFF4", color: "#16a34a" }}
                  >
                    <span>✓</span> Photo ready
                  </div>
                </div>
              ) : (
                <>
                  {/* Drop zone */}
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="rounded-xl border-2 border-dashed transition-all p-4 flex flex-col items-center gap-2.5 cursor-pointer"
                    style={{
                      borderColor: isDragging ? "#E799AA" : "#f0dde2",
                      background: isDragging ? "#fdf5f7" : "#fafafa",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "#fdf2f5", color: "#E799AA" }}
                    >
                      <UploadIcon />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-xs" style={{ color: "#2d2d2d" }}>
                        Upload Your Image
                      </p>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#E799AA" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openCamera() }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
                        style={{ borderColor: "#f0dde2", color: "#7a6068" }}
                      >
                        <CameraIcon />
                        Camera
                      </button>
                    </div>

                    <p className="text-xs" style={{ color: "#c0afb6" }}>
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadPhoto(file)
                      e.target.value = ""
                    }}
                  />
                </>
              )}

              {vtoStatus === "uploading" && (
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "#7a6068" }}>
                  <Spinner size={14} />
                  <span>Uploading...</span>
                </div>
              )}

              {uploadError && (
                <div
                  className="mt-2 text-xs px-3 py-2 rounded-lg"
                  style={{ background: "#fff0f3", border: "1px solid #f8c8d0", color: "#b0384e" }}
                >
                  {uploadError}
                </div>
              )}
            </div>

            {/* Choose Outfit Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#E799AA" }}
                />
                <h2 className="font-semibold text-sm" style={{ color: "#2d2d2d" }}>
                  Choose Your Outfit
                </h2>
              </div>

              {productsLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center" style={{ color: "#9c8589" }}>
                  <Spinner size={16} />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : products.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "#9c8589" }}>
                  No products found.
                </p>
              ) : (
                <div
                  style={{
                    height: "260px",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                <div
                  className="grid grid-cols-3 md:grid-cols-4 gap-1.5"
                >
                  {products.map((product) => {
                    const isSelected = selectedProduct?.id === product.id
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          if (vtoStatus === "processing") cancelInFlight()
                          setSelectedProduct(product)
                          setResultImageUrl(null)
                          setVtoError(null)
                          if (vtoStatus !== "idle") setVtoStatus("idle")
                        }}
                        className="relative rounded-lg overflow-hidden transition-all"
                        style={{
                          aspectRatio: "3/4",
                          border: isSelected ? "2px solid #E799AA" : "2px solid transparent",
                          boxShadow: isSelected ? "0 0 0 2px rgba(231,153,170,0.3)" : "0 1px 3px rgba(0,0,0,0.07)",
                          outline: "none",
                        }}
                      >
                        {getVtoImageUrl(product) ? (
                          <img
                            src={getVtoImageUrl(product)}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xs text-center px-1"
                            style={{ background: "#fdf2f5", color: "#9c8589" }}
                          >
                            {product.title}
                          </div>
                        )}
                        {isSelected && (
                          <div
                            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "#E799AA" }}
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                </div>
              )}

              {selectedProduct && (
                <div
                  className="mt-2 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ background: "#fdf2f5", color: "#7a6068" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E799AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="font-medium" style={{ color: "#2d2d2d" }}>{selectedProduct.title}</span>
                </div>
              )}
            </div>

            {/* Try It On Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: canSubmit ? "linear-gradient(135deg, #E799AA 0%, #d4788e 100%)" : "#e5d5d8",
                color: canSubmit ? "#fff" : "#b0a0a4",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 4px 20px rgba(231,153,170,0.4)" : "none",
                letterSpacing: "0.05em",
              }}
            >
              {vtoStatus === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size={14} />
                  Preparing...
                </span>
              ) : !photoUrl ? "Upload a photo first" : !selectedProduct ? "Select an outfit first" : "Try It On"}
            </button>
          </div>

          {/* ─── RIGHT COLUMN ────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Result Panel */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#E799AA" }}
                />
                <h2 className="font-semibold text-base" style={{ color: "#2d2d2d" }}>
                  Virtual Try-On Result
                </h2>
              </div>

              {/* Idle state */}
              {(vtoStatus === "idle" || vtoStatus === "uploading") && !resultImageUrl && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "500px" }}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "#fdf2f5" }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E799AA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-center" style={{ color: "#9c8589" }}>
                    Upload your photo and select an outfit
                  </p>
                </div>
              )}

              {/* Processing state */}
              {(vtoStatus === "processing" || vtoStatus === "submitting") && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "500px" }}>
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #fdf2f5 0%, #f2c4cf 100%)",
                        animation: "spin 2s linear infinite",
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full bg-white flex items-center justify-center"
                    >
                      <SparkleIcon />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "#2d2d2d" }}>
                      AI is fitting your outfit...
                    </p>
                    <p className="text-sm" style={{ color: "#9c8589" }}>
                      30–90 seconds
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: "#E799AA",
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed state */}
              {vtoStatus === "completed" && resultImageUrl && (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
                    <img
                      src={resultImageUrl}
                      alt="Virtual try-on result"
                      className="w-full h-full object-cover"
                      style={{ background: "#fafafa", minHeight: "500px" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: "#E799AA" }}
                    >
                      <DownloadIcon />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Failed / timed out state */}
              {(vtoStatus === "failed" || vtoStatus === "timed_out") && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "500px" }}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "#fff1f2" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1" style={{ color: "#2d2d2d" }}>
                      {vtoStatus === "timed_out" ? "Try-on timed out" : "Try-on failed"}
                    </p>
                    <p className="text-sm" style={{ color: "#9c8589" }}>
                      {vtoError || "Try a different photo or outfit."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "#E799AA" }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-base mb-4" style={{ color: "#2d2d2d" }}>
              Take a Photo
            </h3>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "3/4", maxHeight: 360 }}>
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
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                style={{ borderColor: "#f0dde2", color: "#7a6068" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#E799AA" }}
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.7; }
          40% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default VirtualTryOnPage
