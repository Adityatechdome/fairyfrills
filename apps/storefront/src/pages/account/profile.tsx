import { AccountLayout } from "@/components/account-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomer } from "@/lib/context/customer"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

const ProfilePage = () => {
  const { customer } = useCustomer()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [profileMsg, setProfileMsg] = useState("")
  const [profileError, setProfileError] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || "")
      setLastName(customer.last_name || "")
    }
  }, [customer])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg("")
    setProfileError("")

    if (!firstName || !lastName) {
      setProfileError("First name and last name are required.")
      return
    }

    setProfileLoading(true)
    try {
      await sdk.store.customer.update({
        first_name: firstName,
        last_name: lastName,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.customer.all })
      setProfileMsg("Profile updated successfully.")
    } catch {
      setProfileError("Failed to update profile. Please try again.")
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <AccountLayout>
      <div className="max-w-xl">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text)] mb-6">
          My Profile
        </h1>

        <form onSubmit={handleProfileUpdate} className="space-y-5">
          {profileMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              {profileMsg}
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {profileError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Last Name
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Email Address
            </label>
            <Input type="email" value={customer?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-[var(--color-text-light)] mt-1">
              Email cannot be changed.
            </p>
          </div>

          {customer?.phone && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Phone Number
              </label>
              <Input type="tel" value={customer.phone} disabled className="opacity-60" />
              <p className="text-xs text-[var(--color-text-light)] mt-1">
                Phone number cannot be changed.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" size="fit" disabled={profileLoading}>
            {profileLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </AccountLayout>
  )
}

export default ProfilePage
