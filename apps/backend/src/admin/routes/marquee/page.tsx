import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Text } from "@medusajs/ui"
import { Minus } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const MarqueePage = () => {
  const [items, setItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItem, setNewItem] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/marquee")
      setItems(data.marquee?.text_items || [])
    } catch (e) {
      console.error("Failed to fetch marquee", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const saveItems = async (textItems: string[]) => {
    try {
      await sdk.client.fetch("/admin/marquee", { method: "POST", body: { text_items: textItems, is_active: true } })
      fetchData()
    } catch (e) {
      console.error("Failed to save marquee", e)
    }
  }

  const addItem = () => {
    if (newItem.trim()) {
      const updated = [...items, newItem.trim()]
      setItems(updated)
      setNewItem("")
      saveItems(updated)
    }
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    saveItems(updated)
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Marquee Ticker</Heading>
        <Text className="text-ui-fg-subtle mt-1">Manage scrolling text items shown on the storefront.</Text>
      </div>

      <div className="px-6 py-4 space-y-3">
        <div className="flex gap-3">
          <Input placeholder="Add ticker text..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
          <Button size="small" onClick={addItem}>Add</Button>
        </div>

        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : items.length === 0 ? (
          <Text className="text-ui-fg-subtle">No ticker items yet.</Text>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg">
                <Text size="small">{item}</Text>
                <button onClick={() => removeItem(index)} className="text-ui-fg-muted hover:text-ui-fg-base text-sm cursor-pointer">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Marquee Ticker",
  icon: Minus,
})

export default MarqueePage
