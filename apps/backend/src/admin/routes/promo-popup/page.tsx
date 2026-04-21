import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Badge, Text, Switch, Label } from "@medusajs/ui"
import { Photo } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

const PromoPopupPage = () => {
  const [popup, setPopup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    is_active: false,
    banner_image_url: "",
    top_label: "",
    main_heading: "",
    sub_text: "",
    button_text: "",
    button_link: "",
    footer_note: "",
    show_dont_show_again: true,
    delay_seconds: 1,
    cooldown_hours: 48,
  })

  const fetchData = useCallback(async (bust = false) => {
    try {
      setIsLoading(true)
      const url = bust ? `/admin/promo-popup?_=${Date.now()}` : "/admin/promo-popup"
      const data = await sdk.client.fetch<any>(url)
      if (data.popups && data.popups.length > 0) {
        const p = data.popups[0]
        setPopup(p)
        setForm({
          is_active: p.is_active ?? false,
          banner_image_url: p.banner_image_url ?? "",
          top_label: p.top_label ?? "",
          main_heading: p.main_heading ?? "",
          sub_text: p.sub_text ?? "",
          button_text: p.button_text ?? "",
          button_link: p.button_link ?? "",
          footer_note: p.footer_note ?? "",
          show_dont_show_again: p.show_dont_show_again ?? true,
          delay_seconds: p.delay_seconds ?? 1,
          cooldown_hours: p.cooldown_hours ?? 48,
        })
      }
    } catch (e) {
      console.error("Failed to fetch promo popup", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const { files: uploaded } = await sdk.admin.upload.create({ files: [file] })
      const url = uploaded?.[0]?.url
      if (url) {
        setForm((f) => ({ ...f, banner_image_url: url }))
      }
    } catch (e) {
      console.error("Upload failed", e)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const payload = {
        ...form,
        banner_image_url: form.banner_image_url || null,
        top_label: form.top_label || null,
        main_heading: form.main_heading || null,
        sub_text: form.sub_text || null,
        button_text: form.button_text || null,
        button_link: form.button_link || null,
        footer_note: form.footer_note || null,
        delay_seconds: Number(form.delay_seconds),
        cooldown_hours: Number(form.cooldown_hours),
      }
      if (popup?.id) {
        await sdk.client.fetch(`/admin/promo-popup/${popup.id}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/promo-popup", { method: "POST", body: payload })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchData(true)
    } catch (e) {
      console.error("Failed to save", e)
    } finally {
      setIsSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type: "text" | "textarea" | "number" = "text") => (
    <div className="space-y-1">
      <Label size="small" weight="plus">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={String(form[key])}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={2}
        />
      ) : (
        <Input
          type={type}
          value={String(form[key])}
          onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        />
      )}
    </div>
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Heading level="h2">Promotional Popup</Heading>
          <Badge size="2xsmall" color={form.is_active ? "green" : "grey"}>
            {form.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Button
          size="small"
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
        >
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {isLoading ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-6">

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
            <div>
              <Text weight="plus">Show Popup on Homepage</Text>
              <Text size="small" className="text-ui-fg-subtle">Turn this on to display the popup to visitors</Text>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label size="small" weight="plus">Banner Image</Label>
            {form.banner_image_url && (
              <img
                src={form.banner_image_url}
                alt="Banner"
                className="w-full max-h-48 object-cover rounded-lg border border-ui-border-base"
              />
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Or paste an image URL"
                value={form.banner_image_url}
                onChange={(e) => setForm({ ...form, banner_image_url: e.target.value })}
                className="flex-1"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                  e.target.value = ""
                }}
              />
              <Button
                size="small"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
              >
                <Photo />
                Upload
              </Button>
            </div>
          </div>

          {/* Text Content */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              {field("Top Label", "top_label")}
              {field("Main Heading", "main_heading")}
            </div>
            {field("Sub Text", "sub_text")}
            <div className="grid grid-cols-2 gap-4">
              {field("Button Text", "button_text")}
              {field("Button Link (URL)", "button_link")}
            </div>
            {field("Footer Note", "footer_note")}
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <Text weight="plus" className="text-ui-fg-base">Behavior Settings</Text>
            <div className="grid grid-cols-2 gap-4">
              {field("Delay before showing (seconds)", "delay_seconds", "number")}
              {field("Cooldown after dismiss (hours)", "cooldown_hours", "number")}
            </div>
            <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-lg">
              <div>
                <Text weight="plus">Show "Don't show again today" checkbox</Text>
                <Text size="small" className="text-ui-fg-subtle">Lets visitors opt out for the cooldown period</Text>
              </div>
              <Switch
                checked={form.show_dont_show_again}
                onCheckedChange={(v) => setForm({ ...form, show_dont_show_again: v })}
              />
            </div>
          </div>

          {/* Preview hint */}
          <div className="p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
            <Text size="small" className="text-ui-fg-subtle">
              Changes take effect immediately on the storefront after saving. Visitors who have already dismissed the popup will see it again once their {form.cooldown_hours}-hour cooldown expires.
            </Text>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Promo Popup",
  icon: Photo,
})

export default PromoPopupPage
