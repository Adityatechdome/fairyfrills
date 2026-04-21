import { useQuery } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"

const LOGO_URL =
  "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/Untitled-Design-40x40px-01KJG0HQMDZE57AWAVFVCHC8RT.jpg"

const SparkleIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2 L13.5 9 L20 10 L13.5 11 L12 18 L10.5 11 L4 10 L10.5 9 Z" />
    <path d="M19 2 L19.8 5.2 L23 6 L19.8 6.8 L19 10 L18.2 6.8 L15 6 L18.2 5.2 Z" opacity="0.7" />
    <path d="M5 17 L5.6 19.4 L8 20 L5.6 20.6 L5 23 L4.4 20.6 L2 20 L4.4 19.4 Z" opacity="0.6" />
  </svg>
)

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const AuthLoginDecorativePanel = () => {
  const { data } = useQuery({
    queryKey: ["site-settings", "auth-banner"],
    queryFn: async () => {
      const result = await sdk.client.fetch<{ auth_banner_image_url: string | null }>(
        "/store/site-settings"
      )
      return result
    },
    staleTime: 1000 * 60 * 5,
  })

  const bannerImage = data?.auth_banner_image_url ?? null

  return (
    <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center overflow-hidden min-h-screen">
      {/* Background */}
      {bannerImage ? (
        <img
          src={bannerImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #f06292 0%, #e91e8c 50%, #c2185b 100%)",
          }}
        />
      )}

      {/* Pink overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(231,153,170,0.40)" }}
      />

      {/* Decorative soft circles */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          top: "-60px",
          right: "-80px",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          bottom: "-40px",
          left: "-60px",
        }}
      />

      {/* Scattered sparkles */}
      <span className="absolute text-white/60 top-10 left-10">
        <SparkleIcon size={14} />
      </span>
      <span className="absolute text-white/50 top-16 right-16">
        <SparkleIcon size={10} />
      </span>
      <span className="absolute text-white/50 bottom-20 right-12">
        <SparkleIcon size={12} />
      </span>
      <span className="absolute text-white/40 bottom-32 left-8">
        <SparkleIcon size={10} />
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-10 text-center w-full max-w-sm">
        {/* Logo + Brand name */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-white/90">
              <SparkleIcon size={22} />
            </span>
            <span
              className="text-white font-serif text-4xl font-bold tracking-wide drop-shadow-md"
            >
              Fairy Frills
            </span>
            <span className="text-white/90">
              <SparkleIcon size={22} />
            </span>
          </div>
          <div
            className="w-10 h-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.6)" }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-white text-xl leading-snug"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}
        >
          "Where Every Little Girl<br />Becomes a Princess"
        </p>

        {/* Testimonial card */}
        <div
          className="w-full rounded-2xl px-6 py-5 text-left"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <p
            className="text-white text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            "The amount of appreciation her dress got was beyond comprehension!! Thanks a ton for making her day super special."
          </p>
          <p className="text-white/80 text-xs mt-3 font-medium">— Priya Sharma, Happy Mom</p>
        </div>

        {/* Stars + join count */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1">
            <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
          </div>
          <p className="text-white text-sm">
            Join <strong>10,000+</strong> magical moms
          </p>
        </div>
      </div>
    </div>
  )
}

const AuthRegisterDecorativePanel = () => {
  const { data } = useQuery({
    queryKey: ["site-settings", "auth-banner"],
    queryFn: async () => {
      const result = await sdk.client.fetch<{ auth_banner_image_url: string | null }>(
        "/store/site-settings"
      )
      return result
    },
    staleTime: 1000 * 60 * 5,
  })

  const bannerImage = data?.auth_banner_image_url ?? null

  return (
    <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center overflow-hidden min-h-screen">
      {/* Background */}
      {bannerImage ? (
        <img
          src={bannerImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #f06292 0%, #e91e8c 50%, #c2185b 100%)",
          }}
        />
      )}

      {/* Pink overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(231,153,170,0.40)" }}
      />

      {/* Decorative soft circles */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          top: "-60px",
          right: "-80px",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          bottom: "-40px",
          left: "-60px",
        }}
      />

      {/* Scattered sparkles */}
      <span className="absolute text-white/60 top-10 left-10">
        <SparkleIcon size={14} />
      </span>
      <span className="absolute text-white/50 top-16 right-16">
        <SparkleIcon size={10} />
      </span>
      <span className="absolute text-white/50 bottom-20 right-12">
        <SparkleIcon size={12} />
      </span>
      <span className="absolute text-white/40 bottom-32 left-8">
        <SparkleIcon size={10} />
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-10 text-center w-full max-w-sm">
        {/* Logo + Brand name */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-white/90">
              <SparkleIcon size={22} />
            </span>
            <span
              className="text-white font-serif text-4xl font-bold tracking-wide drop-shadow-md"
            >
              Fairy Frills
            </span>
            <span className="text-white/90">
              <SparkleIcon size={22} />
            </span>
          </div>
          <div
            className="w-10 h-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.6)" }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-white text-xl leading-snug"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}
        >
          "Where Every Little Girl<br />Becomes a Princess"
        </p>

        {/* Why join section */}
        <div className="w-full text-left">
          <p className="text-white font-semibold text-base text-center mb-4">
            Why join Fairy Frills?
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <SparkleIcon size={14} />
              </div>
              <span className="text-white text-sm">Exclusive member discounts</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <rect x="3" y="8" width="18" height="13" rx="2" ry="2"/>
                  <path d="M16 8V6a4 4 0 0 0-8 0v2" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="text-white text-sm">Early access to new collections</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span className="text-white text-sm">Order tracking &amp; history</span>
            </div>
          </div>
        </div>

        {/* Stars + join count */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1">
            <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
          </div>
          <p className="text-white text-sm">
            Join <strong>10,000+</strong> magical moms
          </p>
        </div>
      </div>
    </div>
  )
}

export { AuthLoginDecorativePanel, AuthRegisterDecorativePanel }
export default AuthLoginDecorativePanel
