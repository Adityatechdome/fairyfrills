import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text } from "@medusajs/ui"
import { Trash, PencilSquare } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ message: "", order: 0, is_active: true })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/announcements")
      setAnnouncements(data.announcements || [])
    } catch (e) {
      console.error("Failed to fetch announcements", e)
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
    setForm({ message: "", order: 0, is_active: true })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({ message: item.message, order: item.order, is_active: item.is_active })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await sdk.client.fetch(`/admin/announcements/${editId}`, { method: "POST", body: form })
      } else {
        await sdk.client.fetch("/admin/announcements", { method: "POST", body: form })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save announcement", e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/announcements/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete announcement", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/announcements/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle announcement", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Announcements</Heading>
        <Button size="small" variant="secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Announcement"}
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <Input placeholder="Announcement message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="flex gap-3">
            <Input type="number" placeholder="Order" value={String(form.order)} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            <Button size="small" onClick={handleSubmit}>
              {editId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : announcements.length === 0 ? (
          <Text className="text-ui-fg-subtle">No announcements yet</Text>
        ) : (
          <div className="space-y-3">
            {announcements.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Text size="small">{item.message}</Text>
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
  label: "Announcements",
  icon: PencilSquare,
})

export default AnnouncementsPage
