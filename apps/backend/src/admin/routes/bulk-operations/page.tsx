import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PuzzleSolid } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

type AddSizeResult = {
  success: boolean
  total: number
  processed: number
  skipped: number
  failed: number
  errors: string[]
}

type UpdatePricesResult = {
  success: boolean
  csv_rows: number
  products_in_csv: number
  updated: number
  not_found: number
  not_found_list: string[]
  failed: number
  errors: string[]
}

const BulkOperationsPage = () => {
  const [csvContent, setCsvContent] = useState("")
  const [addSizeResult, setAddSizeResult] = useState<AddSizeResult | null>(null)
  const [updatePricesResult, setUpdatePricesResult] =
    useState<UpdatePricesResult | null>(null)

  const addSizeMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<AddSizeResult>("/admin/bulk-operations/add-size-variants", {
        method: "POST",
      }),
    onSuccess: (data) => {
      setAddSizeResult(data)
      if (data.failed === 0) {
        toast.success(
          `Done! ${data.processed} products updated, ${data.skipped} already had sizes.`
        )
      } else {
        toast.warning(
          `Completed with errors. ${data.processed} updated, ${data.failed} failed.`
        )
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add size variants")
    },
  })

  const updatePricesMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<UpdatePricesResult>("/admin/bulk-operations/update-prices", {
        method: "POST",
        body: { csv_content: csvContent },
      }),
    onSuccess: (data) => {
      setUpdatePricesResult(data)
      if (data.failed === 0 && data.not_found === 0) {
        toast.success(`Done! ${data.updated} products updated.`)
      } else {
        toast.warning(
          `Completed. ${data.updated} updated, ${data.not_found} not found, ${data.failed} failed.`
        )
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update prices")
    },
  })

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === "string") setCsvContent(text)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="flex flex-col gap-y-4 p-8">
      <div>
        <Heading level="h1">Bulk Operations</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          One-time tools to set up size variants and update prices across all products.
        </Text>
      </div>

      {/* Step 1 - Add Size Variants */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Step 1 — Add Size Variants to All Products</Heading>
            <Text className="text-ui-fg-subtle mt-1" size="small">
              Replaces every product's default variant with 18 size variants
              (0-3 months → 15-16 yrs). Each variant is priced at the product's
              existing INR base price. Safe to re-run — products that already
              have a "Size" option are skipped.
            </Text>
          </div>
        </div>

        <div className="px-6 py-4">
          <Button
            size="small"
            onClick={() => addSizeMutation.mutate()}
            isLoading={addSizeMutation.isPending}
            disabled={addSizeMutation.isPending}
          >
            {addSizeMutation.isPending
              ? "Running... (this may take a few minutes)"
              : "Run: Add Size Variants"}
          </Button>

          {addSizeMutation.isPending && (
            <Text className="text-ui-fg-subtle mt-3" size="small">
              Processing all products — please keep this page open and do not
              refresh. This can take 2-5 minutes for 235 products.
            </Text>
          )}

          {addSizeResult && (
            <div className="mt-4 flex flex-col gap-y-2">
              <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Text size="small" weight="plus">Total products</Text>
                  <Text size="small" className="text-ui-fg-subtle">{addSizeResult.total}</Text>
                  <Text size="small" weight="plus">Processed (sizes added)</Text>
                  <Text size="small" className="text-ui-fg-subtle">{addSizeResult.processed}</Text>
                  <Text size="small" weight="plus">Skipped (already had sizes)</Text>
                  <Text size="small" className="text-ui-fg-subtle">{addSizeResult.skipped}</Text>
                  <Text size="small" weight="plus">Failed</Text>
                  <Text
                    size="small"
                    className={
                      addSizeResult.failed > 0
                        ? "text-ui-fg-error"
                        : "text-ui-fg-subtle"
                    }
                  >
                    {addSizeResult.failed}
                  </Text>
                </div>
              </div>
              {addSizeResult.errors.length > 0 && (
                <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error mb-2">
                    Errors:
                  </Text>
                  {addSizeResult.errors.map((err, i) => (
                    <Text key={i} size="small" className="text-ui-fg-error">
                      {err}
                    </Text>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Step 2 - Update Prices from CSV */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Step 2 — Update Prices from CSV</Heading>
            <Text className="text-ui-fg-subtle mt-1" size="small">
              Paste or upload your CSV to update variant prices. Format:
              Product Name, Variant Size, Price (one row per size).
              Sizes not listed for a product inherit the last price in the CSV
              for that product.
            </Text>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-y-4">
          <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
            <Text size="small" weight="plus" className="mb-1">CSV format example:</Text>
            <pre className="text-ui-fg-subtle text-xs font-mono whitespace-pre-wrap">
              {`Product Name,Variant Size,Price
Pink Butterfly Dress,3-4 yrs,999
Pink Butterfly Dress,4-5 yrs,1099
Pink Butterfly Dress,5-6 yrs,1199`}
            </pre>
          </div>

          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-3">
              <Text size="small" weight="plus">Upload CSV file:</Text>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
                <Button size="small" variant="secondary" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {csvContent && (
                <Text size="small" className="text-ui-fg-subtle">
                  {csvContent.split("\n").filter(Boolean).length - 1} data rows loaded
                </Text>
              )}
            </div>

            <Text size="small" className="text-ui-fg-subtle">
              Or paste CSV content directly:
            </Text>
            <Textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={"Product Name,Variant Size,Price\nMy Dress,3-4 yrs,999\n..."}
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <Button
              size="small"
              onClick={() => updatePricesMutation.mutate()}
              isLoading={updatePricesMutation.isPending}
              disabled={!csvContent.trim() || updatePricesMutation.isPending}
            >
              {updatePricesMutation.isPending
                ? "Updating prices..."
                : "Run: Update Prices from CSV"}
            </Button>
          </div>

          {updatePricesMutation.isPending && (
            <Text className="text-ui-fg-subtle" size="small">
              Updating prices — please keep this page open and do not refresh.
            </Text>
          )}

          {updatePricesResult && (
            <div className="flex flex-col gap-y-2">
              <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <Text size="small" weight="plus">CSV rows read</Text>
                  <Text size="small" className="text-ui-fg-subtle">{updatePricesResult.csv_rows}</Text>
                  <Text size="small" weight="plus">Products in CSV</Text>
                  <Text size="small" className="text-ui-fg-subtle">{updatePricesResult.products_in_csv}</Text>
                  <Text size="small" weight="plus">Products updated</Text>
                  <Text size="small" className="text-ui-fg-subtle">{updatePricesResult.updated}</Text>
                  <Text size="small" weight="plus">Not found in DB</Text>
                  <Text
                    size="small"
                    className={
                      updatePricesResult.not_found > 0
                        ? "text-ui-fg-error"
                        : "text-ui-fg-subtle"
                    }
                  >
                    {updatePricesResult.not_found}
                  </Text>
                  <Text size="small" weight="plus">Failed</Text>
                  <Text
                    size="small"
                    className={
                      updatePricesResult.failed > 0
                        ? "text-ui-fg-error"
                        : "text-ui-fg-subtle"
                    }
                  >
                    {updatePricesResult.failed}
                  </Text>
                </div>
              </div>

              {updatePricesResult.not_found_list.length > 0 && (
                <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error mb-1">
                    Products not found in database (check spelling):
                  </Text>
                  {updatePricesResult.not_found_list.map((name, i) => (
                    <Text key={i} size="small" className="text-ui-fg-error">
                      • {name}
                    </Text>
                  ))}
                </div>
              )}

              {updatePricesResult.errors.length > 0 && (
                <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error mb-1">
                    Errors:
                  </Text>
                  {updatePricesResult.errors.map((err, i) => (
                    <Text key={i} size="small" className="text-ui-fg-error">
                      {err}
                    </Text>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bulk Operations",
  icon: PuzzleSolid,
})

export default BulkOperationsPage
