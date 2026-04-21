import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Text } from "@medusajs/ui"
import { Minus } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const FooterContentPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    brand_description: "",
    instagram_url: "",
    youtube_url: "",
    facebook_url: "",
    twitter_url: "",
    pinterest_url: "",
    email: "",
    phone: "",
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<any>("/admin/footer")
      if (data?.footer) {
        setForm({
          brand_description: data.footer.brand_description || "",
          instagram_url: data.footer.instagram_url || "",
          youtube_url: data.footer.youtube_url || "",
          facebook_url: data.footer.facebook_url || "",
          twitter_url: data.footer.twitter_url || "",
          pinterest_url: data.footer.pinterest_url || "",
          email: data.footer.email || "",
          phone: data.footer.phone || "",
        })
      }
    } catch (e) {
      console.error("Failed to fetch footer", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await sdk.client.fetch("/admin/footer", { method: "POST", body: { ...form, is_active: true } })
      fetchData()
    } catch (e) {
      console.error("Failed to save footer", e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Footer Content</Heading>
        <Text className="text-ui-fg-subtle mt-1">Manage footer information displayed on the storefront.</Text>
      </div>

      <div className="px-6 py-4 space-y-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : (
          <>
            <div>
              <Text size="small" weight="plus" className="mb-1">Brand Description</Text>
              <Textarea placeholder="Brand description..." value={form.brand_description} onChange={(e) => setForm({ ...form, brand_description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="small" weight="plus" className="mb-1">Instagram URL</Text>
                <Input value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">YouTube URL</Text>
                <Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">Facebook URL</Text>
                <Input value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">Twitter URL</Text>
                <Input value={form.twitter_url} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">Pinterest URL</Text>
                <Input value={form.pinterest_url} onChange={(e) => setForm({ ...form, pinterest_url: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">Email</Text>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-1">Phone</Text>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <Button size="small" onClick={handleSave}>
              {isSaving ? "Saving..." : "Save Footer Content"}
            </Button>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Footer Content",
  icon: Minus,
})

export default FooterContentPage
