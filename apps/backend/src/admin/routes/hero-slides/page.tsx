import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea, Label, Select } from "@medusajs/ui"
import { Trash, PencilSquare, Photo } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

type TextPosition = "top-left" | "top-center" | "top-right" | "middle-left" | "middle-center" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right"

const PositionGrid = ({ 
  value, 
  onChange, 
  allowClear = false 
}: { 
  value?: TextPosition
  onChange: (val: TextPosition | null) => void
  allowClear?: boolean
}) => {
  const positions: TextPosition[] = [
    "top-left", "top-center", "top-right",
    "middle-left", "middle-center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right"
  ]

  const getPositionLabel = (pos: TextPosition) => {
    const [vertical, horizontal] = pos.split("-")
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] uppercase tracking-wider opacity-70">{vertical}</span>
        <span className="text-xs font-medium">{horizontal}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
        {positions.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            className={`
              relative h-20 rounded-md border-2 transition-all duration-200 flex items-center justify-center
              ${value === pos 
                ? "border-[#E799AA] bg-[#E799AA]/10 shadow-md scale-105" 
                : "border-ui-border-base hover:border-ui-border-strong hover:bg-ui-bg-subtle-hover"
              }
            `}
          >
            {getPositionLabel(pos)}
            {value === pos && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#E799AA] rounded-full" />
            )}
          </button>
        ))}
      </div>
      {allowClear && value && (
        <Button 
          type="button"
          size="small" 
          variant="secondary" 
          onClick={() => onChange(null)}
        >
          Use Desktop Position
        </Button>
      )}
    </div>
  )
}

const DEFAULT_FORM = {
  background_image_url: "",
  mobile_background_image_url: "",
  badge_text: "",
  heading: "",
  highlight_text: "",
  subheading: "",
  heading_color: "",
  highlight_color: "",
  subheading_color: "",
  badge_text_color: "",
  primary_button_text_color: "",
  secondary_button_text_color: "",
  stats_text_color: "",
  primary_button_label: "Shop Now",
  primary_button_link: "/categories/birthday-outfits",
  secondary_button_label: "Virtual Try-On",
  secondary_button_link: "/virtual-try-on",
  stat_1_value: "",
  stat_1_label: "",
  stat_2_value: "",
  stat_2_label: "",
  stat_3_value: "",
  stat_3_label: "",
  text_position: "middle-left" as TextPosition,
  mobile_text_position: null as null | TextPosition,
  sort_order: 0,
  is_active: true,
}

type FormState = typeof DEFAULT_FORM

const ImageUploadField = ({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  required?: boolean
}) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const { files: uploaded } = await sdk.admin.upload.create({ files: [file] })
      const url = (uploaded as any[])[0]?.url
      if (url) onChange(url)
    } catch (e) {
      console.error("Upload failed", e)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-ui-fg-base text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          required={required}
        />
        <Button
          size="small"
          variant="secondary"
          type="button"
          isLoading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Photo />
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>
      {value && (
        <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-ui-border-base" />
      )}
    </div>
  )
}

const HeroSlidesPage = () => {
  const [slides, setSlides] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/hero-slides")
      setSlides(data.slides || [])
    } catch (e) {
      console.error("Failed to fetch hero slides", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ ...DEFAULT_FORM })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      background_image_url: item.background_image_url || "",
      mobile_background_image_url: item.mobile_background_image_url || "",
      badge_text: item.badge_text || "",
      heading: item.heading || "",
      highlight_text: item.highlight_text || "",
      subheading: item.subheading || "",
      heading_color: item.heading_color || "",
      highlight_color: item.highlight_color || "",
      subheading_color: item.subheading_color || "",
      badge_text_color: item.badge_text_color || "",
      primary_button_text_color: item.primary_button_text_color || "",
      secondary_button_text_color: item.secondary_button_text_color || "",
      stats_text_color: item.stats_text_color || "",
      primary_button_label: item.primary_button_label || "Shop Now",
      primary_button_link: item.primary_button_link || "/categories/birthday-outfits",
      secondary_button_label: item.secondary_button_label || "Virtual Try-On",
      secondary_button_link: item.secondary_button_link || "/virtual-try-on",
      stat_1_value: item.stat_1_value || "",
      stat_1_label: item.stat_1_label || "",
      stat_2_value: item.stat_2_value || "",
      stat_2_label: item.stat_2_label || "",
      stat_3_value: item.stat_3_value || "",
      stat_3_label: item.stat_3_label || "",
      text_position: item.text_position || "middle-left",
      mobile_text_position: item.mobile_text_position || null,
      sort_order: item.sort_order || 0,
      is_active: item.is_active ?? true,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.background_image_url) {
      alert("Background image is required")
      return
    }

    try {
      const payload = { ...form }
      if (editId) {
        await sdk.client.fetch(`/admin/hero-slides/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/hero-slides", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save hero slide", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hero slide?")) return
    try {
      await sdk.client.fetch(`/admin/hero-slides/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete hero slide", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/hero-slides/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle hero slide", e)
    }
  }

  const set = (key: keyof FormState) => (val: string | number | boolean | null) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Hero Carousel Slides</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage full-width background carousel slides with independent content and positioning
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => { resetForm(); setShowForm(true) }}>
          Add Slide
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-6 space-y-6">
          <div>
            <Heading level="h3" className="mb-4">Background Images</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Desktop: 1920 × 800px (landscape). Mobile: 600 × 900px (portrait). Upload both for best results on all devices.
            </Text>
            <div className="space-y-4">
              <ImageUploadField
                label="Desktop Background (1920 × 800px)"
                value={form.background_image_url}
                onChange={(url) => set("background_image_url")(url)}
                required
              />
              <ImageUploadField
                label="Mobile Background (600 × 900px)"
                value={form.mobile_background_image_url}
                onChange={(url) => set("mobile_background_image_url")(url)}
              />
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Content</Heading>
            <div className="space-y-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Badge Text</Label>
                <Input placeholder="e.g. Handcrafted with Love" value={form.badge_text} onChange={(e) => set("badge_text")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Heading (before highlight)</Label>
                <Input placeholder="e.g. Dresses Made for" value={form.heading} onChange={(e) => set("heading")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Highlight Text (shown in pink)</Label>
                <Input placeholder="e.g. Every Fairy Tale Moment" value={form.highlight_text} onChange={(e) => set("highlight_text")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Subheading</Label>
                <Textarea placeholder="Short description..." value={form.subheading} onChange={(e) => set("subheading")(e.target.value)} rows={3} />
              </div>
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Text Colors (Optional)</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Set custom colors for each text element. Leave empty to use default colors (white for heading/subheading, pink gradient for highlight).
            </Text>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Heading Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.heading_color || "#ffffff"} 
                    onChange={(e) => set("heading_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.heading_color} 
                    onChange={(e) => set("heading_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Highlight Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.highlight_color || "#E799AA"} 
                    onChange={(e) => set("highlight_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#E799AA" 
                    value={form.highlight_color} 
                    onChange={(e) => set("highlight_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Subheading Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.subheading_color || "#ffffff"} 
                    onChange={(e) => set("subheading_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.subheading_color} 
                    onChange={(e) => set("subheading_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Element Colors (Optional)</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Customize colors for badge, buttons, and stats. Leave empty to use default white colors.
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Badge Text Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.badge_text_color || "#ffffff"} 
                    onChange={(e) => set("badge_text_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.badge_text_color} 
                    onChange={(e) => set("badge_text_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Stats Text Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.stats_text_color || "#ffffff"} 
                    onChange={(e) => set("stats_text_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.stats_text_color} 
                    onChange={(e) => set("stats_text_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Primary Button Text Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.primary_button_text_color || "#ffffff"} 
                    onChange={(e) => set("primary_button_text_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.primary_button_text_color} 
                    onChange={(e) => set("primary_button_text_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Secondary Button Text Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={form.secondary_button_text_color || "#ffffff"} 
                    onChange={(e) => set("secondary_button_text_color")(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    placeholder="#ffffff" 
                    value={form.secondary_button_text_color} 
                    onChange={(e) => set("secondary_button_text_color")(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Buttons</Heading>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Primary Button Label</Label>
                <Input placeholder="Shop Now" value={form.primary_button_label} onChange={(e) => set("primary_button_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Primary Button Link</Label>
                <Input placeholder="/categories/birthday-outfits" value={form.primary_button_link} onChange={(e) => set("primary_button_link")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Secondary Button Label</Label>
                <Input placeholder="Virtual Try-On" value={form.secondary_button_label} onChange={(e) => set("secondary_button_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Secondary Button Link</Label>
                <Input placeholder="/virtual-try-on" value={form.secondary_button_link} onChange={(e) => set("secondary_button_link")(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Stats Row</Heading>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Stat 1 Value</Label>
                <Input placeholder="500+" value={form.stat_1_value} onChange={(e) => set("stat_1_value")(e.target.value)} />
                <Input className="mt-2" placeholder="Label (e.g. Happy Families)" value={form.stat_1_label} onChange={(e) => set("stat_1_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Stat 2 Value</Label>
                <Input placeholder="100%" value={form.stat_2_value} onChange={(e) => set("stat_2_value")(e.target.value)} />
                <Input className="mt-2" placeholder="Label (e.g. Handcrafted)" value={form.stat_2_label} onChange={(e) => set("stat_2_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Stat 3 Value</Label>
                <Input placeholder="Global" value={form.stat_3_value} onChange={(e) => set("stat_3_value")(e.target.value)} />
                <Input className="mt-2" placeholder="Label (e.g. Shipping)" value={form.stat_3_label} onChange={(e) => set("stat_3_label")(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Text Positioning - Desktop</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-3">
              Click on the grid to position text precisely on the background image
            </Text>
            <PositionGrid 
              value={form.text_position} 
              onChange={(val) => set("text_position")(val)}
            />
          </div>

          <div>
            <Heading level="h3" className="mb-4">Text Positioning - Mobile (Optional)</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-3">
              Override text position for mobile. Leave unselected to use desktop positioning.
            </Text>
            <PositionGrid 
              value={form.mobile_text_position ?? undefined} 
              onChange={(val) => set("mobile_text_position")(val)}
              allowClear
            />
          </div>

          <div>
            <Heading level="h3" className="mb-4">Settings</Heading>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Display Order</Label>
                <Input type="number" placeholder="0" value={String(form.sort_order)} onChange={(e) => set("sort_order")(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-ui-border-base">
            <Button onClick={handleSubmit}>
              {editId ? "Update Slide" : "Create Slide"}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : slides.length === 0 ? (
          <Text className="text-ui-fg-subtle">No slides yet. Add a hero slide to display the carousel on the storefront.</Text>
        ) : (
          <div className="space-y-4">
            {slides.map((item: any) => (
              <div key={item.id} className="border border-ui-border-base rounded-lg overflow-hidden">
                <div className="flex items-start justify-between p-4">
                  <div className="flex gap-4 flex-1">
                    {item.background_image_url && (
                      <img src={item.background_image_url} alt="Slide" className="w-32 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Text size="small" className="text-ui-fg-subtle">Order: {item.sort_order}</Text>
                        <Badge size="2xsmall" color="grey">
                          {item.text_position || `${item.text_horizontal_align}-${item.text_vertical_position}`}
                        </Badge>
                      </div>
                      {item.heading && (
                        <Text className="font-medium text-ui-fg-base">
                          {item.heading} <span className="text-[#E799AA]">{item.highlight_text}</span>
                        </Text>
                      )}
                      {item.subheading && (
                        <Text size="small" className="text-ui-fg-subtle mt-1 line-clamp-2">{item.subheading}</Text>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggle(item)}
                      className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer"
                      title="Toggle active"
                    >
                      <Badge size="2xsmall" color="grey">
                        {item.is_active ? "Deactivate" : "Activate"}
                      </Badge>
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer" title="Edit">
                      <PencilSquare />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-ui-fg-muted hover:text-red-500 cursor-pointer" title="Delete">
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Hero Carousel",
  icon: Photo,
})

export default HeroSlidesPage
