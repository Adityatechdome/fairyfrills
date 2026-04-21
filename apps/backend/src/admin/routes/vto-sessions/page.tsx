import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
} from "@medusajs/ui"
import { Photo, EllipsisHorizontal, Trash } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import { useState, useEffect, useCallback, useRef } from "react"

type VtoSessionRecord = {
  id: string
  customer_id: string
  customer_name: string | null
  customer_email: string | null
  model_photo_url: string
  product_image_url: string
  product_id: string | null
  result_image_url: string | null
  status: "pending" | "processing" | "completed" | "failed" | "timed_out" | "abandoned"
  saved: boolean
  created_at: string
  completed_at: string | null
  error_message: string | null
}

const STATUS_CONFIG: Record<
  VtoSessionRecord["status"],
  { label: string; color: "grey" | "green" | "red" | "orange" | "blue" | "purple" }
> = {
  completed: { label: "Completed", color: "green" },
  processing: { label: "Processing", color: "orange" },
  pending: { label: "Pending", color: "blue" },
  failed: { label: "Failed", color: "red" },
  timed_out: { label: "Timed Out", color: "purple" },
  abandoned: { label: "Abandoned", color: "grey" },
}

const PAGE_SIZE = 20

function RowMenu({
  sessionId,
  onDelete,
}: {
  sessionId: string
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-ui-bg-subtle transition-colors text-ui-fg-subtle hover:text-ui-fg-base"
        title="More options"
      >
        <EllipsisHorizontal />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-flyout py-1"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onDelete(sessionId)
            }}
            className="flex w-full items-center gap-x-2 px-3 py-2 text-sm text-ui-fg-error hover:bg-ui-bg-subtle transition-colors"
          >
            <Trash />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteConfirmModal({
  sessionId,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  sessionId: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="bg-ui-bg-base rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-y-4 shadow-elevation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-y-1">
          <Heading level="h3">Delete Session</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            This will permanently delete the VTO session. This action cannot be undone.
          </Text>
        </div>
        <div className="flex items-center justify-end gap-x-2">
          <Button size="small" variant="secondary" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button size="small" variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const VtoSessionsPage = () => {
  const [sessions, setSessions] = useState<VtoSessionRecord[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewLabel, setPreviewLabel] = useState<string>("")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (statusFilter) params.set("status", statusFilter)

      const data = await sdk.client.fetch<{
        sessions: VtoSessionRecord[]
        count: number
      }>(`/admin/vto-sessions?${params.toString()}`)

      setSessions(data.sessions || [])
      setCount(data.count || 0)
    } catch (e) {
      console.error("Failed to fetch VTO sessions", e)
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      await sdk.client.fetch(`/admin/vto-sessions?id=${deleteTargetId}`, {
        method: "DELETE",
      })
      setDeleteTargetId(null)
      await fetchData()
    } catch (e) {
      console.error("Failed to delete VTO session", e)
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openPreview = (url: string, label: string) => {
    setPreviewImage(url)
    setPreviewLabel(label)
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Heading level="h2">Virtual Try-On Sessions</Heading>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {count} total session{count !== 1 ? "s" : ""}
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(0)
                setStatusFilter(e.target.value)
              }}
              className="rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm text-ui-fg-base focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="timed_out">Timed Out</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <Button size="small" variant="secondary" onClick={fetchData}>
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-6 py-12">
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Loading sessions...
            </Text>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 gap-y-2">
            <Photo className="text-ui-fg-muted" style={{ width: 32, height: 32 }} />
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              No try-on sessions found
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base">
                  <th className="px-4 py-3 text-left">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Customer
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Time
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Input Photo
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Outfit
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Result
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Status
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Text size="xsmall" leading="compact" weight="plus" className="text-ui-fg-subtle uppercase tracking-wide">
                      Saved
                    </Text>
                  </th>
                  <th className="px-4 py-3 text-center" style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-base">
                {sessions.map((session) => {
                  const statusCfg = STATUS_CONFIG[session.status] || { label: session.status, color: "grey" as const }
                  return (
                    <tr key={session.id} className="hover:bg-ui-bg-subtle transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-y-0.5">
                          <Text size="small" leading="compact" weight="plus">
                            {session.customer_name || "Unknown"}
                          </Text>
                          {session.customer_email && (
                            <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                              {session.customer_email}
                            </Text>
                          )}
                          <Text size="xsmall" leading="compact" className="text-ui-fg-muted font-mono">
                            {session.customer_id.slice(0, 12)}...
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Text size="xsmall" leading="compact" className="text-ui-fg-subtle whitespace-nowrap">
                          {formatDate(session.created_at)}
                        </Text>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {session.model_photo_url ? (
                          <button
                            type="button"
                            onClick={() => openPreview(session.model_photo_url, "Customer Photo")}
                            className="inline-block rounded-md overflow-hidden border border-ui-border-base hover:border-ui-border-strong transition-colors"
                            style={{ width: 48, height: 64 }}
                            title="View customer photo"
                          >
                            <img
                              src={session.model_photo_url}
                              alt="Customer"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </button>
                        ) : (
                          <Text size="xsmall" className="text-ui-fg-muted">—</Text>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {session.product_image_url ? (
                          <button
                            type="button"
                            onClick={() => openPreview(session.product_image_url, "Outfit Image")}
                            className="inline-block rounded-md overflow-hidden border border-ui-border-base hover:border-ui-border-strong transition-colors"
                            style={{ width: 48, height: 64 }}
                            title="View outfit"
                          >
                            <img
                              src={session.product_image_url}
                              alt="Outfit"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </button>
                        ) : (
                          <Text size="xsmall" className="text-ui-fg-muted">—</Text>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {session.result_image_url ? (
                          <button
                            type="button"
                            onClick={() => openPreview(session.result_image_url!, "Try-On Result")}
                            className="inline-block rounded-md overflow-hidden border border-ui-border-base hover:border-ui-border-strong transition-colors"
                            style={{ width: 48, height: 64 }}
                            title="View result"
                          >
                            <img
                              src={session.result_image_url}
                              alt="Result"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </button>
                        ) : (
                          <Text size="xsmall" className="text-ui-fg-muted">
                            {session.status === "failed" ? "Failed" : "—"}
                          </Text>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge size="2xsmall" color={statusCfg.color}>
                          {statusCfg.label}
                        </Badge>
                        {session.error_message && (
                          <Text size="xsmall" leading="compact" className="text-ui-fg-error mt-1">
                            {session.error_message.slice(0, 60)}
                          </Text>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {session.saved ? (
                          <Badge size="2xsmall" color="green">Saved</Badge>
                        ) : (
                          <Text size="xsmall" className="text-ui-fg-muted">—</Text>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RowMenu
                          sessionId={session.id}
                          onDelete={(id) => setDeleteTargetId(id)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4">
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Page {page + 1} of {totalPages} ({count} total)
            </Text>
            <div className="flex items-center gap-x-2">
              <Button
                size="small"
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Container>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-ui-bg-base rounded-xl p-4 max-w-lg w-full mx-4 flex flex-col gap-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Text size="small" leading="compact" weight="plus">
                {previewLabel}
              </Text>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setPreviewImage(null)}
              >
                Close
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden" style={{ maxHeight: 500 }}>
              <img
                src={previewImage}
                alt={previewLabel}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <DeleteConfirmModal
          sessionId={deleteTargetId}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "VTO History",
  icon: Photo,
})

export default VtoSessionsPage
