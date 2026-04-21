import { AccountLayout } from "@/components/account-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { HttpTypes } from "@medusajs/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type AddressFormData = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}

const emptyAddress: AddressFormData = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "in",
  phone: "",
}

const AddressForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  initialData: AddressFormData
  onSubmit: (data: AddressFormData) => void
  onCancel: () => void
  loading: boolean
  submitLabel: string
}) => {
  const [form, setForm] = useState<AddressFormData>(initialData)
  const [error, setError] = useState("")

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.first_name || !form.last_name || !form.address_1 || !form.city || !form.postal_code) {
      setError("Please fill in all required fields.")
      return
    }

    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-[var(--color-border-light)] p-5 mb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            First Name *
          </label>
          <Input
            value={form.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Last Name *
          </label>
          <Input
            value={form.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          Address Line 1 *
        </label>
        <Input
          value={form.address_1}
          onChange={(e) => handleChange("address_1", e.target.value)}
          placeholder="Street address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          Address Line 2
        </label>
        <Input
          value={form.address_2}
          onChange={(e) => handleChange("address_2", e.target.value)}
          placeholder="Apartment, suite, etc. (optional)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            City *
          </label>
          <Input
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            State / Province
          </label>
          <Input
            value={form.province}
            onChange={(e) => handleChange("province", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Pincode *
          </label>
          <Input
            value={form.postal_code}
            onChange={(e) => handleChange("postal_code", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          Phone
        </label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="fit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="secondary" size="fit" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  deleting,
}: {
  address: HttpTypes.StoreCustomerAddress
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) => {
  return (
    <div className="border border-[var(--color-border-light)] p-5">
      <p className="font-medium text-[var(--color-text)]">
        {address.first_name} {address.last_name}
      </p>
      <p className="text-sm text-[var(--color-text-light)] mt-1">{address.address_1}</p>
      {address.address_2 && (
        <p className="text-sm text-[var(--color-text-light)]">{address.address_2}</p>
      )}
      <p className="text-sm text-[var(--color-text-light)]">
        {address.city}
        {address.province ? `, ${address.province}` : ""} {address.postal_code}
      </p>
      <p className="text-sm text-[var(--color-text-light)] uppercase">
        {address.country_code}
      </p>
      {address.phone && (
        <p className="text-sm text-[var(--color-text-light)] mt-1">{address.phone}</p>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" size="fit" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" size="fit" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  )
}

const AddressesPage = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: addresses, isLoading } = useQuery({
    queryKey: [...queryKeys.customer.all, "addresses"],
    queryFn: async () => {
      const response = await sdk.store.customer.listAddress()
      return response.addresses
    },
  })

  const invalidateAddresses = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customer.all })
  }

  const handleAdd = async (data: AddressFormData) => {
    setSaving(true)
    try {
      await sdk.store.customer.createAddress(data)
      invalidateAddresses()
      setShowForm(false)
    } catch {
      // error handled in form
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data: AddressFormData) => {
    if (!editingId) return
    setSaving(true)
    try {
      await sdk.store.customer.updateAddress(editingId, data)
      invalidateAddresses()
      setEditingId(null)
    } catch {
      // error handled in form
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await sdk.store.customer.deleteAddress(id)
      invalidateAddresses()
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  const editingAddress = addresses?.find((a) => a.id === editingId)

  return (
    <AccountLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text)]">
          My Addresses
        </h1>
        {!showForm && !editingId && (
          <Button variant="primary" size="fit" onClick={() => setShowForm(true)}>
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <AddressForm
          initialData={emptyAddress}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={saving}
          submitLabel="Add Address"
        />
      )}

      {editingId && editingAddress && (
        <AddressForm
          initialData={{
            first_name: editingAddress.first_name || "",
            last_name: editingAddress.last_name || "",
            address_1: editingAddress.address_1 || "",
            address_2: editingAddress.address_2 || "",
            city: editingAddress.city || "",
            province: editingAddress.province || "",
            postal_code: editingAddress.postal_code || "",
            country_code: editingAddress.country_code || "in",
            phone: editingAddress.phone || "",
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditingId(null)}
          loading={saving}
          submitLabel="Update Address"
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {!isLoading && (!addresses || addresses.length === 0) && !showForm && (
        <div className="text-center py-16 border border-[var(--color-border-light)]">
          <p className="text-[var(--color-text-light)] text-base">
            You don't have any saved addresses yet.
          </p>
        </div>
      )}

      {!isLoading && addresses && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => {
                setShowForm(false)
                setEditingId(address.id)
              }}
              onDelete={() => handleDelete(address.id)}
              deleting={deletingId === address.id}
            />
          ))}
        </div>
      )}
    </AccountLayout>
  )
}

export default AddressesPage
