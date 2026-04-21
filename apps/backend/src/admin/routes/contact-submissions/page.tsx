import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text } from "@medusajs/ui"
import { Trash, EnvelopeSolid } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback } from "react"

const statusColors: Record<string, "orange" | "blue" | "green" | "grey"> = {
  new: "orange",
  read: "blue",
  replied: "green",
}

const ContactSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await sdk.client.fetch<any>("/admin/contact-submissions", {
        cache: "no-store",
      } as any)
      setSubmissions(data.submissions || [])
    } catch (e: any) {
      console.error("Failed to fetch contact submissions", e)
      setError(e?.message || String(e))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await sdk.client.fetch(`/admin/contact-submissions/${id}`, { method: "POST", body: { status } })
      fetchData()
    } catch (e) {
      console.error("Failed to update status", e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return
    try {
      await sdk.client.fetch(`/admin/contact-submissions/${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Failed to delete submission", e)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Contact Submissions</Heading>
        <Text className="text-ui-fg-subtle">{submissions.filter((s: any) => s.status === "new").length} new</Text>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading...</Text>
        ) : error ? (
          <div className="flex flex-col gap-2">
            <Text className="text-ui-fg-subtle">
              {error.includes("401") || error.toLowerCase().includes("unauthorized")
                ? "Session expired. Please refresh the page or log in again."
                : `Failed to load: ${error}`}
            </Text>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 bg-ui-button-neutral text-ui-fg-base rounded hover:bg-ui-button-neutral-hover w-fit cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <Text className="text-ui-fg-subtle">No contact submissions yet.</Text>
        ) : (
          <div className="space-y-3">
            {submissions.map((item: any) => (
              <div key={item.id} className="border border-ui-border-base rounded-lg">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <Badge size="2xsmall" color={statusColors[item.status] || "grey"}>
                      {item.status}
                    </Badge>
                    {item.first_name === "Newsletter" && item.last_name === "Subscriber" && (
                      <Badge size="2xsmall" color="purple">newsletter</Badge>
                    )}
                    <div>
                      <Text className="font-medium text-sm">
                        {item.first_name === "Newsletter" && item.last_name === "Subscriber"
                          ? item.email
                          : `${item.first_name} ${item.last_name}`}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">{item.email}</Text>
                    </div>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </div>

                {expanded === item.id && (
                  <div className="px-3 pb-3 border-t border-ui-border-base pt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div><span className="text-ui-fg-subtle">Phone:</span> {item.phone || "N/A"}</div>
                      <div><span className="text-ui-fg-subtle">Country:</span> {item.country || "N/A"}</div>
                    </div>
                    <div className="bg-ui-bg-subtle p-3 rounded text-sm mb-3">{item.message}</div>
                    <div className="flex gap-2">
                      {item.status !== "read" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "read")}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                      {item.status !== "replied" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "replied")}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 cursor-pointer ml-auto"
                        >
                          Mark as Replied
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 cursor-pointer ml-auto"
                      >
                        <Trash className="inline w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Contact Submissions",
  icon: EnvelopeSolid,
})

export default ContactSubmissionsPage
