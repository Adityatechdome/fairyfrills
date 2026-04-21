import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => sdk.client.fetch<any>("/store/announcements"),
    staleTime: 60000,
  })

  const announcements = data?.announcements || []

  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [announcements.length])

  if (announcements.length === 0) return null

  return (
    <div className="bg-[var(--color-primary)] text-white text-center py-2.5 px-4 relative overflow-hidden">
      <div className="relative h-5">
        {announcements.map((a: any, i: number) => (
          <span
            key={a.id}
            className="absolute inset-0 flex items-center justify-center text-sm font-medium tracking-wide transition-all duration-500"
            style={{
              opacity: i === currentIndex ? 1 : 0,
              transform: i === currentIndex ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {a.message}
          </span>
        ))}
      </div>
    </div>
  )
}
