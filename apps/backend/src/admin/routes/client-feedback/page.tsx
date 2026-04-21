import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea, Label, Select } from "@medusajs/ui"
import { Trash, PencilSquare, ChatBubble } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
]

const RATINGS = [1, 2, 3, 4, 5]

const ClientFeedbackPage = () => {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    image_url: "",
    customer_name: "",
    city: "",
    platform: "whatsapp",
    rating: 5,
    caption: "",
    sort_order: 0,
    is_active: true,
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/client-feedback")
      setEntries(data.entries || [])
    } catch (e) {
      console.error("Failed to fetch client feedback", e)
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
    setForm({ image_url: "", customer_name: "", city: "", platform: "whatsapp", rating: 5, caption: "", sort_order: 0, is_active: true })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const { files: uploaded } = await sdk.admin.upload.create({ files: Array.from(files) })
      if (uploaded && uploaded.length > 0) {
        setForm((prev) => ({ ...prev, image_url: uploaded[0].url }))
      }
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const { files: uploaded } = await sdk.admin.upload.create({ files: Array.from(files) })
      if (uploaded && uploaded.length > 0) {
        const maxOrder = entries.length > 0 ? Math.max(...entries.map((en) => en.sort_order)) : -1
        for (let i = 0; i < uploaded.length; i++) {
          await sdk.client.fetch("/admin/client-feedback", {
            method: "POST",
            body: {
              image_url: uploaded[i].url,
              customer_name: "Customer",
              city: null,
              platform: "whatsapp",
              rating: 5,
              caption: null,
              sort_order: maxOrder + 1 + i,
              is_active: true,
            },
          })
        }
        fetchData()
      }
    } catch (err) {
      console.error("Bulk upload failed", err)
    } finally {
      setUploading(false)
      if (bulkInputRef.current) bulkInputRef.current.value = ""
    }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      image_url: item.image_url,
      customer_name: item.customer_name,
      city: item.city || "",
      platform: item.platform,
      rating: item.rating ?? 5,
      caption: item.caption || "",
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        city: form.city || null,
        caption: form.caption || null,
      }
      if (editId) {
        await sdk.client.fetch(`/admin/client-feedback/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/client-feedback", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save", e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/client-feedback/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/client-feedback/${item.id}`, {
        method: "POST",
        body: { is_active: !item.is_active },
      })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Client Feedback</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Customer reviews with images, star ratings, and city info
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBulkUpload}
              disabled={uploading}
            />
            <Button size="small" variant="secondary" type="button" asChild>
              <span>{uploading ? "Uploading..." : "Bulk Upload"}</span>
            </Button>
          </label>
          <Button size="small" variant="secondary" onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
            {showForm ? "Cancel" : "Add Feedback"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-4">
          {/* Image upload */}
          <div>
            <Label size="xsmall" weight="plus">Customer / Product Image</Label>
            {form.image_url ? (
              <div className="flex items-center gap-3 mt-1">
                <img src={form.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-ui-border-base" />
                <Button size="small" variant="secondary" onClick={() => fileInputRef.current?.click()}>Change</Button>
              </div>
            ) : (
              <div
                className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-ui-border-base rounded-lg p-6 cursor-pointer hover:border-ui-border-strong transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ChatBubble className="text-ui-fg-muted mb-2" />
                <Text size="small" className="text-ui-fg-subtle">
                  {uploading ? "Uploading..." : "Click to upload customer/product image"}
                </Text>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Row 1: Name, City, Platform */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label size="xsmall" weight="plus">Customer Name</Label>
              <Input
                placeholder="e.g. Priya Sharma"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label size="xsmall" weight="plus">City (optional)</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label size="xsmall" weight="plus">Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {PLATFORMS.map((p) => (
                    <Select.Item key={p.value} value={p.value}>{p.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          {/* Row 2: Rating, Sort Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label size="xsmall" weight="plus">Star Rating</Label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: Number(v) })}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {RATINGS.map((r) => (
                    <Select.Item key={r} value={String(r)}>
                      {"★".repeat(r)}{"☆".repeat(5 - r)} ({r}/5)
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label size="xsmall" weight="plus">Sort Order</Label>
              <Input
                type="number"
                value={String(form.sort_order)}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Review text */}
          <div>
            <Label size="xsmall" weight="plus">Review Text</Label>
            <Textarea
              placeholder="What did the customer say? e.g. The fabric quality is amazing and my daughter absolutely loved the dress!"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="mt-1"
            />
          </div>

          <Button size="small" onClick={handleSubmit} disabled={!form.image_url || !form.customer_name || uploading}>
            {editId ? "Update" : "Create"}
          </Button>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : entries.length === 0 ? (
          <Text className="text-ui-fg-subtle">No feedback yet. Add customer reviews with images and star ratings.</Text>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((item: any) => (
              <div key={item.id} className="relative group border border-ui-border-base rounded-xl overflow-hidden bg-white">
                <img src={item.image_url} alt={item.customer_name} className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(item)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer">
                      <Badge size="2xsmall" color={item.is_active ? "green" : "grey"} className="!p-0 w-3 h-3 rounded-full" />
                    </button>
                    <button onClick={() => handleEdit(item)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer">
                      <PencilSquare className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                    {item.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <div className="p-2.5">
                  <Text size="xsmall" weight="plus" className="truncate">{item.customer_name}</Text>
                  {item.city && (
                    <Text size="xsmall" className="text-ui-fg-subtle truncate">{item.city}</Text>
                  )}
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-xs" style={{ color: i < (item.rating ?? 5) ? "#E799AA" : "#d1d5db" }}>
                        ★
                      </span>
                    ))}
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
  label: "Client Feedback",
  icon: ChatBubble,
})

export default ClientFeedbackPage
