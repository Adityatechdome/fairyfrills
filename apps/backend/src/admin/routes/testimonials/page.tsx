import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Badge, Text } from "@medusajs/ui"
import { Trash, PencilSquare } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: "",
    review_text: "",
    rating: 5,
    product_id: "",
    order: 0,
    is_active: true,
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/testimonials")
      setTestimonials(data.testimonials || [])
    } catch (e) {
      console.error("Failed to fetch testimonials", e)
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
    setForm({ customer_name: "", review_text: "", rating: 5, product_id: "", order: 0, is_active: true })
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      customer_name: item.customer_name,
      review_text: item.review_text,
      rating: item.rating,
      product_id: item.product_id || "",
      order: item.order,
      is_active: item.is_active,
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = { ...form, product_id: form.product_id || null }
      if (editId) {
        await sdk.client.fetch(`/admin/testimonials/${editId}`, { method: "POST", body: payload })
      } else {
        await sdk.client.fetch("/admin/testimonials", { method: "POST", body: payload })
      }
      resetForm()
      fetchData()
    } catch (e) {
      console.error("Failed to save testimonial", e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/testimonials/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete testimonial", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Testimonials</Heading>
        <Button size="small" variant="secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Testimonial"}
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-3">
          <Input placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          <Textarea placeholder="Review text" value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" placeholder="Rating (1-5)" value={String(form.rating)} onChange={(e) => setForm({ ...form, rating: Math.min(5, Math.max(1, Number(e.target.value))) })} />
            <Input placeholder="Product ID (optional)" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} />
            <Input type="number" placeholder="Order" value={String(form.order)} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
          <Button size="small" onClick={handleSubmit}>
            {editId ? "Update" : "Create"}
          </Button>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : testimonials.length === 0 ? (
          <Text className="text-ui-fg-subtle">No testimonials yet.</Text>
        ) : (
          <div className="space-y-3">
            {testimonials.map((item: any) => (
              <div key={item.id} className="p-3 border border-ui-border-base rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge size="2xsmall" color={item.is_active ? "green" : "grey"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Text size="small" weight="plus">{item.customer_name}</Text>
                    <Text size="small" className="text-ui-fg-subtle">{"*".repeat(item.rating)}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(item)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer">
                      <PencilSquare />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-ui-fg-muted hover:text-ui-fg-base cursor-pointer">
                      <Trash />
                    </button>
                  </div>
                </div>
                <Text size="small" className="text-ui-fg-subtle mt-2">{item.review_text}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Testimonials",
  icon: PencilSquare,
})

export default TestimonialsPage
