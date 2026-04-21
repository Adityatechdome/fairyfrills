import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Input,
  Select,
  Text,
  Label,
  Switch,
} from "@medusajs/ui"
import { Link as LinkIcon, Plus, Trash, PencilSquare } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

type FooterLink = {
  id: string
  label: string
  url: string
  column: "company_info" | "company_policies"
  sort_order: number
  is_active: boolean
}

const emptyForm = {
  label: "",
  url: "",
  column: "company_info" as "company_info" | "company_policies",
  sort_order: 0,
  is_active: true,
}

const FooterLinksPage = () => {
  const [links, setLinks] = useState<FooterLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await sdk.client.fetch<{ links: FooterLink[] }>(
        "/admin/footer-links"
      )
      setLinks(data.links || [])
    } catch (e) {
      console.error("Failed to fetch footer links", e)
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
      if (editingId) {
        await sdk.client.fetch(`/admin/footer-links/${editingId}`, {
          method: "POST",
          body: form,
        })
      } else {
        await sdk.client.fetch("/admin/footer-links", {
          method: "POST",
          body: form,
        })
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchData()
    } catch (e) {
      console.error("Failed to save footer link", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (link: FooterLink) => {
    setEditingId(link.id)
    setForm({
      label: link.label,
      url: link.url,
      column: link.column,
      sort_order: link.sort_order,
      is_active: link.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this footer link?")) return
    try {
      await sdk.client.fetch(`/admin/footer-links/${id}`, {
        method: "DELETE",
      })
      fetchData()
    } catch (e) {
      console.error("Failed to delete footer link", e)
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const companyInfoLinks = links.filter((l) => l.column === "company_info")
  const companyPolicyLinks = links.filter(
    (l) => l.column === "company_policies"
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Footer Links</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Manage footer navigation links displayed on the storefront.
          </Text>
        </div>
        {!showForm && (
          <Button
            size="small"
            onClick={() => {
              setForm(emptyForm)
              setEditingId(null)
              setShowForm(true)
            }}
          >
            <Plus />
            Add Link
          </Button>
        )}
      </div>

      {showForm && (
        <div className="px-6 py-4 space-y-4">
          <Heading level="h3">
            {editingId ? "Edit Link" : "Add New Link"}
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Label</Label>
              <Input
                placeholder="e.g. Contact Us"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                placeholder="e.g. /contact"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <Label>Column</Label>
              <Select
                value={form.column}
                onValueChange={(val) =>
                  setForm({
                    ...form,
                    column: val as "company_info" | "company_policies",
                  })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select column" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="company_info">Company Info</Select.Item>
                  <Select.Item value="company_policies">
                    Company Policies
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={String(form.sort_order)}
                onChange={(e) =>
                  setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: checked })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="small" onClick={handleSave} isLoading={isSaving}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button size="small" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      ) : (
        <>
          <div className="px-6 py-4">
            <Heading level="h3" className="mb-3">
              Company Info
            </Heading>
            {companyInfoLinks.length === 0 ? (
              <Text className="text-ui-fg-subtle">
                No links in this column yet.
              </Text>
            ) : (
              <div className="space-y-2">
                {companyInfoLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${link.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div>
                        <Text size="small" weight="plus">
                          {link.label}
                        </Text>
                        <Text size="small" className="text-ui-fg-subtle">
                          {link.url}
                        </Text>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => handleEdit(link)}
                      >
                        <PencilSquare />
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4">
            <Heading level="h3" className="mb-3">
              Company Policies
            </Heading>
            {companyPolicyLinks.length === 0 ? (
              <Text className="text-ui-fg-subtle">
                No links in this column yet.
              </Text>
            ) : (
              <div className="space-y-2">
                {companyPolicyLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${link.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div>
                        <Text size="small" weight="plus">
                          {link.label}
                        </Text>
                        <Text size="small" className="text-ui-fg-subtle">
                          {link.url}
                        </Text>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => handleEdit(link)}
                      >
                        <PencilSquare />
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Footer Links",
  icon: LinkIcon,
})

export default FooterLinksPage
