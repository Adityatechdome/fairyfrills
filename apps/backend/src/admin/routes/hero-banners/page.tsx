import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea, Label } from "@medusajs/ui"
import { Trash, PencilSquare, Photo } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

const DEFAULT_FORM = {
  heading: "Dresses Made for",
  highlight_text: "Every Fairy Tale Moment",
  subheading: "Luxury designer outfits for girls — birthday dresses, mother-daughter combos & summer collections. Crafted for comfort, made for magic.",
  badge_text: "Handcrafted with Love",
  shop_now_label: "Shop Now",
  shop_now_link: "/categories/birthday-outfits",
  virtual_tryon_label: "Virtual Try-On",
  virtual_tryon_link: "/virtual-try-on",
  stat_1_value: "500+",
  stat_1_label: "Happy Families",
  stat_2_value: "100%",
  stat_2_label: "Handcrafted",
  stat_3_value: "Global",
  stat_3_label: "Shipping",
  collage_image_1: "",
  collage_image_2: "",
  collage_image_3: "",
  order: 0,
  is_active: true,
}

type FormState = typeof DEFAULT_FORM

const ImageUploadField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (url: string) => void
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
      <Label className="text-ui-fg-base text-sm font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
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
        <img src={value} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-ui-border-base" />
      )}
    </div>
  )
}

const HeroBannersPage = () => {
  const [banners, setBanners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/hero-banners")
      setBanners(data.banners || [])
    } catch (e) {
      console.error("Failed to fetch hero banners", e)
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
      heading: item.heading || DEFAULT_FORM.heading,
      highlight_text: item.highlight_text || DEFAULT_FORM.highlight_text,
      subheading: item.subheading || DEFAULT_FORM.subheading,
      badge_text: item.badge_text || DEFAULT_FORM.badge_text,
      shop_now_label: item.shop_now_label || DEFAULT_FORM.shop_now_label,
      shop_now_link: item.shop_now_link || DEFAULT_FORM.shop_now_link,
      virtual_tryon_label: item.virtual_tryon_label || DEFAULT_FORM.virtual_tryon_label,
      virtual_tryon_link: item.virtual_tryon_link || DEFAULT_FORM.virtual_tryon_link,
      stat_1_value: item.stat_1_value || DEFAULT_FORM.stat_1_value,
      stat_1_label: item.stat_1_label || DEFAULT_FORM.stat_1_label,
      stat_2_value: item.stat_2_value || DEFAULT_FORM.stat_2_value,
      stat_2_label: item.stat_2_label || DEFAULT_FORM.stat_2_label,
      stat_3_value: item.stat_3_value || DEFAULT_FORM.stat_3_value,
      stat_3_label: item.stat_3_label || DEFAULT_FORM.stat_3_label,
      collage_image_1: item.collage_image_1 || "",
      collage_image_2: item.collage_image_2 || "",
      collage_image_3: item.collage_image_3 || "",
      order: item.order || 0,
      is_active: item.is_active ?? true,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = { ...form }
      if (editId) {
        await sdk.client.fetch(`/admin/hero-banners/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/hero-banners", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save hero banner", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hero banner?")) return
    try {
      await sdk.client.fetch(`/admin/hero-banners/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete hero banner", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/hero-banners/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle hero banner", e)
    }
  }

  const set = (key: keyof FormState) => (val: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Hero Banners</Heading>
        <Button size="small" variant="secondary" onClick={() => { resetForm(); setShowForm(true) }}>
          Add Hero Banner
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-6 space-y-6">
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
            <Heading level="h3" className="mb-4">Buttons</Heading>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Primary Button Label</Label>
                <Input placeholder="Shop Now" value={form.shop_now_label} onChange={(e) => set("shop_now_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Primary Button Link</Label>
                <Input placeholder="/categories/birthday-outfits" value={form.shop_now_link} onChange={(e) => set("shop_now_link")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Secondary Button Label</Label>
                <Input placeholder="Virtual Try-On" value={form.virtual_tryon_label} onChange={(e) => set("virtual_tryon_label")(e.target.value)} />
              </div>
              <div>
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Secondary Button Link</Label>
                <Input placeholder="/virtual-try-on" value={form.virtual_tryon_link} onChange={(e) => set("virtual_tryon_link")(e.target.value)} />
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
            <Heading level="h3" className="mb-4">Collage Images</Heading>
            <Text size="small" className="text-ui-fg-subtle mb-4">
              Upload 3 product images to display in the collage grid on the right side of the hero.
            </Text>
            <div className="space-y-4">
              <ImageUploadField
                label="Collage Image 1 (large, left)"
                value={form.collage_image_1}
                onChange={(url) => set("collage_image_1")(url)}
              />
              <ImageUploadField
                label="Collage Image 2 (top right)"
                value={form.collage_image_2}
                onChange={(url) => set("collage_image_2")(url)}
              />
              <ImageUploadField
                label="Collage Image 3 (bottom right)"
                value={form.collage_image_3}
                onChange={(url) => set("collage_image_3")(url)}
              />
            </div>
          </div>

          <div>
            <Heading level="h3" className="mb-4">Settings</Heading>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-ui-fg-base text-sm font-medium mb-1 block">Display Order</Label>
                <Input type="number" placeholder="0" value={String(form.order)} onChange={(e) => set("order")(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-ui-border-base">
            <Button onClick={handleSubmit}>
              {editId ? "Update Banner" : "Create Banner"}
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
        ) : banners.length === 0 ? (
          <Text className="text-ui-fg-subtle">No banners yet. Add a hero banner to display the collage hero section on the storefront.</Text>
        ) : (
          <div className="space-y-4">
            {banners.map((item: any) => (
              <div key={item.id} className="border border-ui-border-base rounded-lg overflow-hidden">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Text size="small" className="text-ui-fg-subtle">Order: {item.order}</Text>
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
                {(item.collage_image_1 || item.collage_image_2 || item.collage_image_3) && (
                  <div className="flex gap-2 p-4 pt-0">
                    {item.collage_image_1 && (
                      <img src={item.collage_image_1} alt="Collage 1" className="w-24 h-16 object-cover rounded" />
                    )}
                    {item.collage_image_2 && (
                      <img src={item.collage_image_2} alt="Collage 2" className="w-24 h-16 object-cover rounded" />
                    )}
                    {item.collage_image_3 && (
                      <img src={item.collage_image_3} alt="Collage 3" className="w-24 h-16 object-cover rounded" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Hero Banners",
  icon: Photo,
})

export default HeroBannersPage
