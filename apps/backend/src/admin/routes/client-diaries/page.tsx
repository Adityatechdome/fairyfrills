import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea, Label } from "@medusajs/ui"
import { Trash, PencilSquare, Photo } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

const ClientDiariesPage = () => {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ image_url: "", title: "", caption: "", sort_order: 0, is_active: true })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/client-diaries")
      setEntries(data.entries || [])
    } catch (e) {
      console.error("Failed to fetch client diaries", e)
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
    setForm({ image_url: "", title: "", caption: "", sort_order: 0, is_active: true })
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
          await sdk.client.fetch("/admin/client-diaries", {
            method: "POST",
            body: {
              image_url: uploaded[i].url,
              title: "",
              caption: "",
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
    }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      image_url: item.image_url,
      title: item.title || "",
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
        title: form.title || null,
        caption: form.caption || null,
      }
      if (editId) {
        await sdk.client.fetch(`/admin/client-diaries/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/client-diaries", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save client diary", e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/client-diaries/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/client-diaries/${item.id}`, {
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
          <Heading level="h2">Client Diaries</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage customer photo gallery images
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
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
            {showForm ? "Cancel" : "Add Image"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <div>
            <Label size="xsmall" weight="plus">Image</Label>
            {form.image_url ? (
              <div className="flex items-center gap-3 mt-1">
                <img src={form.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border border-ui-border-base" />
                <Button size="small" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Change
                </Button>
              </div>
            ) : (
              <div
                className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-ui-border-base rounded-lg p-6 cursor-pointer hover:border-ui-border-strong transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Photo className="text-ui-fg-muted mb-2" />
                <Text size="small" className="text-ui-fg-subtle">
                  {uploading ? "Uploading..." : "Click to upload image"}
                </Text>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label size="xsmall" weight="plus">Title (optional)</Label>
              <Input
                placeholder="e.g. Happy Birthday Aarav!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label size="xsmall" weight="plus">Sort Order</Label>
              <Input
                type="number"
                placeholder="0"
                value={String(form.sort_order)}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label size="xsmall" weight="plus">Caption (optional)</Label>
            <Textarea
              placeholder="Short description..."
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button size="small" onClick={handleSubmit} disabled={!form.image_url || uploading}>
            {editId ? "Update" : "Create"}
          </Button>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : entries.length === 0 ? (
          <Text className="text-ui-fg-subtle">No images yet. Add client photos to display on the storefront.</Text>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {entries.map((item: any) => (
              <div key={item.id} className="relative group border border-ui-border-base rounded-lg overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title || "Client diary"}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer"
                    >
                      <Badge size="2xsmall" color={item.is_active ? "green" : "grey"} className="!p-0 w-3 h-3 rounded-full" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer"
                    >
                      <PencilSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-ui-bg-subtle cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-1.5 left-1.5">
                  <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                    {item.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-2 py-1">
                  <Text size="xsmall" weight="plus" className="truncate">{item.title || `#${item.sort_order}`}</Text>
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
  label: "Client Diaries",
  icon: Photo,
})

export default ClientDiariesPage
