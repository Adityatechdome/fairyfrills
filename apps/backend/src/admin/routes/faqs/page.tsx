import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Badge, Text, Textarea } from "@medusajs/ui"
import { Trash, PencilSquare, QuestionMark } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const FaqsPage = () => {
  const [faqs, setFaqs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ question: "", answer: "", category: "", sort_order: 0, is_active: true })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/faqs")
      setFaqs(data.faqs || [])
    } catch (e) {
      console.error("Failed to fetch FAQs", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ question: "", answer: "", category: "", sort_order: 0, is_active: true })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({ question: item.question, answer: item.answer, category: item.category, sort_order: item.sort_order, is_active: item.is_active })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await sdk.client.fetch(`/admin/faqs/${editId}`, { method: "POST", body: form })
      } else {
        await sdk.client.fetch("/admin/faqs", { method: "POST", body: form })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save FAQ", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return
    try {
      await sdk.client.fetch(`/admin/faqs/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete FAQ", e)
    }
  }

  const handleToggle = async (item: any) => {
    try {
      await sdk.client.fetch(`/admin/faqs/${item.id}`, { method: "POST", body: { is_active: !item.is_active } })
      fetchData()
    } catch (e) {
      console.error("Failed to toggle FAQ", e)
    }
  }

  const grouped = faqs.reduce((acc: Record<string, any[]>, faq: any) => {
    const cat = faq.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {})

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">FAQs</Heading>
        <Button size="small" variant="secondary" onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
          {showForm ? "Cancel" : "Add FAQ"}
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <Input placeholder="Category (e.g. Orders & Shipping)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <Textarea placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} />
          <div className="flex gap-3 items-center">
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
        ) : faqs.length === 0 ? (
          <Text className="text-ui-fg-subtle">No FAQs yet.</Text>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <Text className="font-medium text-ui-fg-base mb-2">{category}</Text>
                <div className="space-y-2">
                  {(items as any[]).map((item: any) => (
                    <div key={item.id} className="flex items-start justify-between p-3 border border-ui-border-base rounded-lg">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <Text className="font-medium text-sm">{item.question}</Text>
                          <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Text size="small" className="text-ui-fg-subtle mt-1">{item.answer.substring(0, 120)}{item.answer.length > 120 ? "..." : ""}</Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "FAQs",
  icon: QuestionMark,
})

export default FaqsPage
