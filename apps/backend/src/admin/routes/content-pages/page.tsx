import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea } from "@medusajs/ui"
import { Trash, PencilSquare, DocumentText } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const ContentPagesPage = () => {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ slug: "", title: "", content: "", is_active: true })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/pages")
      setPages(data.pages || [])
    } catch (e) {
      console.error("Failed to fetch pages", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ slug: "", title: "", content: "", is_active: true })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({ slug: item.slug, title: item.title, content: item.content || "", is_active: item.is_active })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await sdk.client.fetch(`/admin/pages/${editId}`, { method: "POST", body: form })
      } else {
        await sdk.client.fetch("/admin/pages", { method: "POST", body: form })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save page", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return
    try {
      await sdk.client.fetch(`/admin/pages/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete page", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/pages/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle page", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Content Pages</Heading>
        <Button size="small" variant="secondary" onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
          {showForm ? "Cancel" : "Add Page"}
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <Input placeholder="Slug (e.g. privacy-policy)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Page Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Page Content (HTML supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} />
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <Button size="small" onClick={handleSubmit}>{editId ? "Update" : "Create"}</Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : pages.length === 0 ? (
          <Text className="text-ui-fg-subtle">No content pages yet.</Text>
        ) : (
          <div className="space-y-3">
            {pages.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Text className="font-medium">{item.title}</Text>
                    <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">/{item.slug}</Text>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(item)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer">
                    <Badge size="2xsmall" color="grey">Toggle</Badge>
                  </button>
                  <button onClick={() => handleEdit(item)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer">
                    <PencilSquare />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer">
                    <Trash />
                  </button>
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
  label: "Content Pages",
  icon: DocumentText,
})

export default ContentPagesPage
