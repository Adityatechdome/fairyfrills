import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea } from "@medusajs/ui"
import { Trash, PencilSquare, DocumentSeries } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const BlogsPage = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "", slug: "", content: "", thumbnail_url: "", excerpt: "",
    author: "", is_active: true, published_at: "", sort_order: 0,
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/blogs")
      setPosts(data.posts || [])
    } catch (e) {
      console.error("Failed to fetch blogs", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ title: "", slug: "", content: "", thumbnail_url: "", excerpt: "", author: "", is_active: true, published_at: "", sort_order: 0 })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      title: item.title, slug: item.slug, content: item.content || "",
      thumbnail_url: item.thumbnail_url || "", excerpt: item.excerpt || "",
      author: item.author || "", is_active: item.is_active,
      published_at: item.published_at ? item.published_at.substring(0, 10) : "",
      sort_order: item.sort_order,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        thumbnail_url: form.thumbnail_url || null,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      }
      if (editId) {
        await sdk.client.fetch(`/admin/blogs/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/blogs", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save blog post", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return
    try {
      await sdk.client.fetch(`/admin/blogs/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete blog", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/blogs/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle blog", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Blog Posts</Heading>
        <Button size="small" variant="secondary" onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
          {showForm ? "Cancel" : "Add Post"}
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Slug (e.g. my-blog-post)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <Input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
          <Textarea placeholder="Excerpt (short description)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
          <Textarea placeholder="Full Content (HTML supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} />
          <div className="flex gap-3 items-center flex-wrap">
            <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-40" />
            <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="w-40" />
            <Input type="number" placeholder="Order" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-24" />
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
        ) : posts.length === 0 ? (
          <Text className="text-ui-fg-subtle">No blog posts yet.</Text>
        ) : (
          <div className="space-y-3">
            {posts.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg">
                <div className="flex items-center gap-3">
                  {item.thumbnail_url && (
                    <img src={item.thumbnail_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Text className="font-medium">{item.title}</Text>
                      <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Text size="small" className="text-ui-fg-subtle">
                      By {item.author || "Unknown"} | /{item.slug}
                      {item.published_at && ` | ${new Date(item.published_at).toLocaleDateString()}`}
                    </Text>
                  </div>
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
  label: "Blog Posts",
  icon: DocumentSeries,
})

export default BlogsPage
