import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { HttpTypes } from "@medusajs/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useContext, useCallback, type ReactNode } from "react"

type CustomerContextType = {
  customer: HttpTypes.StoreCustomer | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => void
  logout: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomer = () => {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error("useCustomer must be used within CustomerProvider")
  }
  return context
}

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.customer.current(),
    queryFn: async () => {
      try {
        const { customer } = await sdk.store.customer.retrieve()
        return customer
      } catch {
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const logout = useCallback(async () => {
    try {
      await sdk.auth.logout()
    } catch {
      // ignore logout errors
    }
    queryClient.setQueryData(queryKeys.customer.current(), null)
    queryClient.invalidateQueries({ queryKey: queryKeys.customer.all })
  }, [queryClient])

  return (
    <CustomerContext.Provider
      value={{
        customer: data ?? null,
        isLoading,
        isAuthenticated: !!data,
        refetch,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}
