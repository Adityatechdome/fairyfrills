import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Switch, Badge, Button, Textarea, Input } from "@medusajs/ui"
import { CogSixTooth, Photo, Trash } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

const SiteSettingsPage = () => {
  const [confettiEnabled, setConfettiEnabled] = useState(true)
  const [virtualTryonHtml, setVirtualTryonHtml] = useState("")
  const [virtualTryonBgImageUrl, setVirtualTryonBgImageUrl] = useState("")
  const [authBannerImageUrl, setAuthBannerImageUrl] = useState("")
  const [ghlWebhookUrl, setGhlWebhookUrl] = useState("")
  const [ghlOrderWebhookUrl, setGhlOrderWebhookUrl] = useState("")
  const [topSellersSubheading, setTopSellersSubheading] = useState("OUR BESTSELLERS")
  const [topSellersHeading, setTopSellersHeading] = useState("Top Sellers")
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingGhl, setSavingGhl] = useState(false)
  const [savingGhlOrder, setSavingGhlOrder] = useState(false)
  const [savingTopSellers, setSavingTopSellers] = useState(false)
  const [saveGhlOrderSuccess, setSaveGhlOrderSuccess] = useState(false)
  const [saveTopSellersSuccess, setSaveTopSellersSuccess] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingAuthBanner, setUploadingAuthBanner] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveAuthBannerSuccess, setSaveAuthBannerSuccess] = useState(false)
  const [saveGhlSuccess, setSaveGhlSuccess] = useState(false)
  const bgFileRef = useRef<HTMLInputElement>(null)
  const authBannerFileRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/site-settings")
      setConfettiEnabled(data.settings?.confetti_enabled ?? true)
      setVirtualTryonHtml(data.settings?.virtual_tryon_html ?? "")
      setVirtualTryonBgImageUrl(data.settings?.virtual_tryon_bg_image_url ?? "")
      setAuthBannerImageUrl(data.settings?.auth_banner_image_url ?? "")
      setGhlWebhookUrl(data.settings?.ghl_welcome_webhook_url ?? "")
      setGhlOrderWebhookUrl(data.settings?.ghl_order_webhook_url ?? "")
      setTopSellersSubheading(data.settings?.top_sellers_subheading ?? "OUR BESTSELLERS")
      setTopSellersHeading(data.settings?.top_sellers_heading ?? "Top Sellers")
    } catch (e) {
      console.error("Failed to fetch site settings", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleConfetti = async (checked: boolean) => {
    setSaving(true)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: { confetti_enabled: checked },
      })
      setConfettiEnabled(checked)
    } catch (e) {
      console.error("Failed to update site settings", e)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveGhlWebhook = async () => {
    setSavingGhl(true)
    setSaveGhlSuccess(false)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: { ghl_welcome_webhook_url: ghlWebhookUrl || null },
      })
      setSaveGhlSuccess(true)
      setTimeout(() => setSaveGhlSuccess(false), 3000)
    } catch (e) {
      console.error("Failed to save GHL settings", e)
    } finally {
      setSavingGhl(false)
    }
  }

  const handleSaveGhlOrderWebhook = async () => {
    setSavingGhlOrder(true)
    setSaveGhlOrderSuccess(false)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: { ghl_order_webhook_url: ghlOrderWebhookUrl || null },
      })
      setSaveGhlOrderSuccess(true)
      setTimeout(() => setSaveGhlOrderSuccess(false), 3000)
    } catch (e) {
      console.error("Failed to save GHL order settings", e)
    } finally {
      setSavingGhlOrder(false)
    }
  }

  const handleSaveTopSellersHeadings = async () => {
    setSavingTopSellers(true)
    setSaveTopSellersSuccess(false)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: {
          top_sellers_subheading: topSellersSubheading,
          top_sellers_heading: topSellersHeading,
        },
      })
      setSaveTopSellersSuccess(true)
      setTimeout(() => setSaveTopSellersSuccess(false), 3000)
    } catch (e) {
      console.error("Failed to save top sellers headings", e)
    } finally {
      setSavingTopSellers(false)
    }
  }

  const handleSaveVirtualTryon = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: {
          virtual_tryon_html: virtualTryonHtml || null,
          virtual_tryon_bg_image_url: virtualTryonBgImageUrl || null,
        },
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      console.error("Failed to save virtual try-on settings", e)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAuthBanner = async () => {
    setSaving(true)
    setSaveAuthBannerSuccess(false)
    try {
      await sdk.client.fetch("/admin/site-settings", {
        method: "POST",
        body: { auth_banner_image_url: authBannerImageUrl || null },
      })
      setSaveAuthBannerSuccess(true)
      setTimeout(() => setSaveAuthBannerSuccess(false), 3000)
    } catch (e) {
      console.error("Failed to save auth banner settings", e)
    } finally {
      setSaving(false)
    }
  }

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    try {
      const result = await sdk.admin.upload.create({ files: [file] })
      const url = (result as any)?.files?.[0]?.url
      if (url) setVirtualTryonBgImageUrl(url)
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploadingBg(false)
      if (bgFileRef.current) bgFileRef.current.value = ""
    }
  }

  const handleAuthBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAuthBanner(true)
    try {
      const result = await sdk.admin.upload.create({ files: [file] })
      const url = (result as any)?.files?.[0]?.url
      if (url) setAuthBannerImageUrl(url)
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploadingAuthBanner(false)
      if (authBannerFileRef.current) authBannerFileRef.current.value = ""
    }
  }

  if (isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Confetti toggle */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Site Settings</Heading>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-x-2 mb-1">
                <Text size="small" weight="plus">
                  Homepage Confetti
                </Text>
                <Badge size="2xsmall" color={confettiEnabled ? "green" : "grey"}>
                  {confettiEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                Show a celebratory confetti animation when visitors land on the homepage
              </Text>
            </div>
            <Switch
              checked={confettiEnabled}
              onCheckedChange={handleToggleConfetti}
              disabled={saving}
            />
          </div>
        </div>
      </Container>

      {/* Auth Pages Banner Image */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Sign In / Create Account Banner</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              This image appears as the decorative left panel on both the Sign In and Create Account pages. If no image is uploaded, a solid pink background will be shown instead.
            </Text>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" weight="plus">Banner Image</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Recommended: a portrait or tall image (e.g., a flat-lay, product detail, or lifestyle shot). It will be displayed as a full-height cover image with a soft pink overlay.
          </Text>
          <div className="flex items-center gap-x-3">
            {authBannerImageUrl ? (
              <div className="relative">
                <img
                  src={authBannerImageUrl}
                  alt="Auth banner preview"
                  className="h-40 w-32 object-cover rounded-lg border border-ui-border-base"
                />
                <button
                  onClick={() => setAuthBannerImageUrl("")}
                  className="absolute -top-2 -right-2 bg-ui-bg-base border border-ui-border-base rounded-full p-0.5 hover:bg-ui-bg-base-hover"
                >
                  <Trash className="text-ui-fg-subtle w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="h-40 w-32 rounded-lg border-2 border-dashed border-ui-border-base flex items-center justify-center bg-ui-bg-subtle">
                <Text size="xsmall" className="text-ui-fg-muted">No image</Text>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => authBannerFileRef.current?.click()}
                isLoading={uploadingAuthBanner}
              >
                <Photo className="mr-1.5" />
                {authBannerImageUrl ? "Replace Image" : "Upload Image"}
              </Button>
              <input
                ref={authBannerFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAuthBannerUpload}
              />
              {authBannerImageUrl && (
                <Input
                  value={authBannerImageUrl}
                  onChange={(e) => setAuthBannerImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {saveAuthBannerSuccess && (
            <Badge color="green" size="2xsmall">Saved successfully</Badge>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="small"
              onClick={handleSaveAuthBanner}
              isLoading={saving}
            >
              Save Auth Banner
            </Button>
          </div>
        </div>
      </Container>

      {/* Virtual Try-On section */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Virtual Try-On</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Configure the Virtual Try-On section that appears on the homepage. Paste any HTML (including iframes) — it will be rendered inside a fullscreen overlay with camera &amp; microphone permissions enabled.
            </Text>
          </div>
        </div>

        {/* Background image */}
        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" weight="plus">Section Background Image</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Displayed as the banner background behind the "Show Virtual Try-On" button. If left empty, a pink gradient will be used.
          </Text>
          <div className="flex items-center gap-x-3">
            {virtualTryonBgImageUrl ? (
              <div className="relative">
                <img
                  src={virtualTryonBgImageUrl}
                  alt="Background preview"
                  className="h-24 w-48 object-cover rounded-lg border border-ui-border-base"
                />
                <button
                  onClick={() => setVirtualTryonBgImageUrl("")}
                  className="absolute -top-2 -right-2 bg-ui-bg-base border border-ui-border-base rounded-full p-0.5 hover:bg-ui-bg-base-hover"
                >
                  <Trash className="text-ui-fg-subtle w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-48 rounded-lg border-2 border-dashed border-ui-border-base flex items-center justify-center bg-ui-bg-subtle">
                <Text size="xsmall" className="text-ui-fg-muted">No image</Text>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => bgFileRef.current?.click()}
                isLoading={uploadingBg}
              >
                <Photo className="mr-1.5" />
                {virtualTryonBgImageUrl ? "Replace Image" : "Upload Image"}
              </Button>
              <input
                ref={bgFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBgImageUpload}
              />
              {virtualTryonBgImageUrl && (
                <Input
                  value={virtualTryonBgImageUrl}
                  onChange={(e) => setVirtualTryonBgImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* HTML content */}
        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" weight="plus">Virtual Try-On HTML Content</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Paste the embed HTML for your Virtual Try-On experience (e.g., an iframe from your AR provider). This will render inside a fullscreen overlay when customers click the "Show Virtual Try-On" button. Leave empty to hide the section.
          </Text>
          <Textarea
            value={virtualTryonHtml}
            onChange={(e) => setVirtualTryonHtml(e.target.value)}
            placeholder={`<iframe src="https://your-tryon-provider.com/embed" width="100%" height="100%" allow="camera; microphone" frameborder="0"></iframe>`}
            rows={10}
            className="font-mono text-xs"
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            Tip: The overlay renders at full screen size. Use width="100%" and height="100%" on iframes. Camera and microphone permissions are automatically granted.
          </Text>
        </div>

        {/* Save button */}
        <div className="px-6 py-4 flex items-center justify-between">
          {saveSuccess && (
            <Badge color="green" size="2xsmall">Saved successfully</Badge>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="small"
              onClick={handleSaveVirtualTryon}
              isLoading={saving}
            >
              Save Virtual Try-On Settings
            </Button>
          </div>
        </div>
      </Container>

      {/* Top Sellers Section Headings */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Top Sellers Section Headings</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Customize the heading and subheading displayed on the Top Sellers section on the homepage.
            </Text>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-y-3">
          <div>
            <Text size="small" weight="plus" className="mb-1.5">Subheading</Text>
            <Text size="small" className="text-ui-fg-subtle mb-2">
              Small uppercase text above the main heading (e.g., "OUR BESTSELLERS", "HANDPICKED FOR YOU", "MOST LOVED")
            </Text>
            <Input
              value={topSellersSubheading}
              onChange={(e) => setTopSellersSubheading(e.target.value)}
              placeholder="OUR BESTSELLERS"
            />
          </div>

          <div>
            <Text size="small" weight="plus" className="mb-1.5">Main Heading</Text>
            <Text size="small" className="text-ui-fg-subtle mb-2">
              Large heading text below the subheading (e.g., "Top Sellers", "Customer Favorites")
            </Text>
            <Input
              value={topSellersHeading}
              onChange={(e) => setTopSellersHeading(e.target.value)}
              placeholder="Top Sellers"
            />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {saveTopSellersSuccess && (
            <Badge color="green" size="2xsmall">Saved successfully</Badge>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="small"
              onClick={handleSaveTopSellersHeadings}
              isLoading={savingTopSellers}
            >
              Save Top Sellers Headings
            </Button>
          </div>
        </div>
      </Container>

      {/* GoHighLevel Integration */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">GoHighLevel Integration</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              When a new customer registers, their details will be sent to this webhook URL. Use a GHL workflow trigger webhook to add new contacts automatically.
            </Text>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" weight="plus">Welcome Webhook URL</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Paste your GoHighLevel workflow trigger URL below. New customer registrations will POST: email, first_name, last_name, phone.
          </Text>
          <Input
            value={ghlWebhookUrl}
            onChange={(e) => setGhlWebhookUrl(e.target.value)}
            placeholder="https://services.leadconnectorhq.com/hooks/..."
          />
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {saveGhlSuccess && (
            <Badge color="green" size="2xsmall">Saved successfully</Badge>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="small"
              onClick={handleSaveGhlWebhook}
              isLoading={savingGhl}
            >
              Save GHL Settings
            </Button>
          </div>
        </div>

        {/* Order Confirmation Webhook */}
        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" weight="plus">Order Confirmation Webhook URL</Text>
          <Text size="small" className="text-ui-fg-subtle">
            When a new order is placed, full order details are POSTed to this URL. Use it in a GHL workflow to send order confirmation emails or SMS. Available fields: <code className="bg-ui-bg-subtle px-1 rounded text-xs">email</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">first_name</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">last_name</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">order_display_id</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">order_total</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">currency</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">items_summary</code>, <code className="bg-ui-bg-subtle px-1 rounded text-xs">shipping_address_city</code>, and more.
          </Text>
          <Input
            value={ghlOrderWebhookUrl}
            onChange={(e) => setGhlOrderWebhookUrl(e.target.value)}
            placeholder="https://services.leadconnectorhq.com/hooks/..."
          />
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {saveGhlOrderSuccess && (
            <Badge color="green" size="2xsmall">Saved successfully</Badge>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              size="small"
              onClick={handleSaveGhlOrderWebhook}
              isLoading={savingGhlOrder}
            >
              Save Order Webhook
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Site Settings",
  icon: CogSixTooth,
})

export default SiteSettingsPage
