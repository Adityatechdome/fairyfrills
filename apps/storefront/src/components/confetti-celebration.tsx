import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"

const CONFETTI_COLORS = [
  "#E799AA",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#9B59B6",
  "#FF8C42",
  "#00D2D3",
  "#FF6EA1",
  "#FFFFFF",
  "#F368E0",
  "#1DD1A1",
  "#FECA57",
  "#54A0FF",
  "#FF5E78",
]

const ConfettiCelebration = () => {
  const hasFired = useRef(false)

  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => sdk.client.fetch<{ confetti_enabled: boolean }>("/store/site-settings"),
    staleTime: 60000,
  })

  useEffect(() => {
    if (hasFired.current) return
    if (!data || data.confetti_enabled === false) return

    hasFired.current = true

    const duration = 3500
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0 },
        colors: CONFETTI_COLORS,
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0.5,
        disableForReducedMotion: true,
        zIndex: 9999,
      })

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0 },
        colors: CONFETTI_COLORS,
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: -0.5,
        disableForReducedMotion: true,
        zIndex: 9999,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    const timer = setTimeout(frame, 300)

    return () => clearTimeout(timer)
  }, [data])

  return null
}

export default ConfettiCelebration
