# Fairy Frills - Project Instructions

## Brand
- Name: FAIRY FRILLS
- Primary Color: #E799AA (pastel pink)
- Logo: https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/Fairy-frills-logo-01KP7ZMG8G55FCQ1KZ3Q94QJAZ.png
- Region: India (INR)
- Country Code: "in"

## Design System
- Fonts: Cormorant Garamond (serif headings), DM Sans (body)
- CSS variables defined in `apps/storefront/src/styles/theme.css`
- All colors use CSS vars: `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-50`, `--color-text`, `--color-text-light`, `--color-border-light`
- Buttons: rounded-full, primary uses brand pink
- Serif headings via `.font-serif` class
- Page banners: `PageBanner` component at `src/components/page-banner.tsx` (#E799AA bg, white centered title)

## Custom Backend Modules
All registered in `apps/backend/medusa-config.ts`:

| Module | Service Key | Entity |
|--------|------------|--------|
| hero-banner | heroBanner | HeroBanner |
| hero-slide | heroSlide | HeroSlide |
| announcement | announcement | Announcement |
| marquee | marquee | Marquee |
| footer-content | footerContent | FooterContent |
| footer-links | footerLinks | FooterLink |
| testimonial | testimonial | Testimonial |
| content-page | contentPage | ContentPage |
| faq | faq | Faq |
| blog-post | blogPost | BlogPost |
| contact-submission | contactSubmission | ContactSubmission |
| top-seller | topSeller | TopSeller |
| site-settings | siteSettings | SiteSettings |
| client-diary | clientDiary | ClientDiary |
| client-feedback | clientFeedback | ClientFeedback |
| promo-popup | promoPopup | PromoPopup |
| customer-phone | customerPhone | CustomerPhone |
| otp-verification | otpVerification | OtpRecord |

## Custom API Routes
- Store: `/store/hero-banners`, `/store/hero-slides`, `/store/announcements`, `/store/marquee`, `/store/footer`, `/store/footer-links`, `/store/testimonials`, `/store/pages/:slug`, `/store/faqs`, `/store/blogs`, `/store/blogs/:slug`, `POST /store/contact`, `/store/top-sellers`, `/store/site-settings`, `/store/client-diaries`, `/store/client-feedback`, `/store/promo-popup`, `GET /store/auth/status`, `POST /store/otp/email/send`, `POST /store/otp/email/verify`, `POST /store/otp/phone/send`, `POST /store/otp/phone/verify`
- Admin: `/admin/hero-banners[/:id]`, `/admin/hero-slides[/:id]`, `/admin/announcements[/:id]`, `/admin/marquee`, `/admin/footer`, `/admin/footer-links[/:id]`, `/admin/testimonials[/:id]`, `/admin/pages[/:id]`, `/admin/faqs[/:id]`, `/admin/blogs[/:id]`, `/admin/contact-submissions[/:id]`, `/admin/top-sellers[/:id]`, `/admin/site-settings`, `/admin/client-diaries[/:id]`, `/admin/client-feedback[/:id]`, `/admin/promo-popup[/:id]`, `GET /admin/vto-sessions` (paginated, filterable by status, returns enriched with customer name/email)

## Admin Pages
- `src/admin/routes/announcements/page.tsx`
- `src/admin/routes/hero-banners/page.tsx` (legacy)
- `src/admin/routes/hero-slides/page.tsx`
- `src/admin/routes/marquee/page.tsx`
- `src/admin/routes/footer-content/page.tsx`
- `src/admin/routes/footer-links/page.tsx`
- `src/admin/routes/testimonials/page.tsx`
- `src/admin/routes/content-pages/page.tsx`
- `src/admin/routes/faqs/page.tsx`
- `src/admin/routes/blogs/page.tsx`
- `src/admin/routes/contact-submissions/page.tsx`
- `src/admin/routes/site-settings/page.tsx`
- `src/admin/routes/client-diaries/page.tsx`
- `src/admin/routes/client-feedback/page.tsx`
- `src/admin/routes/promo-popup/page.tsx`
- `src/admin/routes/top-sellers/page.tsx`
- `src/admin/routes/bulk-operations/page.tsx` — Bulk Operations: Step 1 adds 18 size variants to all products, Step 2 updates prices from CSV paste/upload
- `src/admin/routes/vto-sessions/page.tsx` — VTO History: read-only table of all customer VTO sessions with customer name/email, input photo, outfit, result thumbnails, status filter, pagination

## Storefront Architecture
- TanStack Start (NOT Next.js)
- Routes: `apps/storefront/src/routes/` with `$param` syntax
- Homepage sections: PromoPopup, ConfettiCelebration, AnnouncementBar, Navbar, HeroCarousel, MarqueeTicker, FeaturedCategories, TopSellers, ClientDiaries, ClientFeedback, Testimonials, Footer
- All homepage content dynamically fetched from Medusa custom modules
- SDK: `apps/storefront/src/lib/utils/sdk.ts`

## Global Search System
- Component: `SearchBar` at `src/components/search-bar.tsx`
- Integrated into `Navbar` — compact popup anchored via `relative` wrapper on the search icon button
- Navbar right icon order: Search → Account → Cart
- Search icon in navbar toggles `searchOpen` state; Escape key also closes
- Search box: 280px wide compact input, absolute positioned below/right of search icon (`top-full right-0`)
- Submitting (Enter or search button) navigates to `/$countryCode/search?q={term}` and closes popup
- Brand color focus ring on input: `#E799AA` / `--color-primary`

## Search Results Page
- Route: `/$countryCode/search` with `q` search param — file at `src/routes/$countryCode/search.tsx`
- Page component: `src/pages/search-results.tsx`
- Displays products in same grid as category page: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Uses `usePaginatedProducts` with `q` param, 20 per page with `Pagination` component
- Shows result count, "No products found" empty state, loading skeleton
- PageBanner header shows `Search: "{query}"`

## Hero Carousel System
- Module: `hero-slide` at `src/modules/hero-slide/` (service key: `heroSlide`, entity: `HeroSlide`)
- Component: `HeroCarousel` at `src/components/hero-carousel.tsx`
- Layout: Full-width background image carousel with dynamic number of slides
- Per-slide content: badge_text, heading, highlight_text, subheading, primary_button (label+link), secondary_button (label+link), stat_1/2/3 (value+label)
- Per-slide color customization (optional, defaults to white):
  - heading_color, highlight_color, subheading_color (text colors for main heading elements)
  - badge_text_color (badge text + sparkle icon color)
  - primary_button_text_color (text color for primary CTA button)
  - secondary_button_text_color (text color for secondary button)
  - stats_text_color (stat values + labels color)
  - Admin UI: color picker inputs for each element in "Text Colors" and "Element Colors" sections
- Per-slide positioning (9-point grid):
  - Desktop: text_position enum with 9 options: top-left, top-center, top-right, middle-left, middle-center, middle-right, bottom-left, bottom-center, bottom-right (default: middle-left)
  - Mobile (optional): mobile_text_position (same 9 options, nullable) — fallback to desktop position if not set
  - Admin UI: visual 3×3 grid selector with brand-colored selection indicator
  - Storefront: converts position to responsive Tailwind classes with proper padding (top/bottom) and alignment (left/center/right)
- Per-slide images:
  - Desktop: background_image_url (1920×800px recommended, landscape)
  - Mobile: mobile_background_image_url (600×900px recommended, portrait) — fallback to desktop if not set
- Admin page: `Admin → Hero Carousel` — add/edit/delete/toggle slides, upload separate desktop/mobile backgrounds, click 9-point grid to position text precisely, customize all text colors
- Store API: `/store/hero-slides` returns active slides sorted by sort_order
- Admin API: `/admin/hero-slides[/:id]` for CRUD operations
- Carousel features: auto-rotation (5s interval), navigation arrows, dot indicators, responsive images & positioning
- Animations: hero-fade-up (staggered text) defined in `theme.css`
- Migrations: `Migration20260415000000.ts` creates hero_slide table, `Migration20260415130210.ts` adds legacy mobile fields, `Migration20260416061500.ts` adds 9-point grid positioning (migrates old separate horizontal/vertical fields to combined position fields), `Migration20260420114939.ts` adds color customization fields (badge_text_color, primary_button_text_color, secondary_button_text_color, stats_text_color)

## Content Pages System
All content is admin-controlled with zero hardcoded text:
- `/$countryCode/privacy-policy` - Renders ContentPage slug "privacy-policy" (page: `src/pages/content-page.tsx`)
- `/$countryCode/shipping-policy` - Renders ContentPage slug "shipping-policy"
- `/$countryCode/terms` - Renders ContentPage slug "terms"
- `/$countryCode/return-policy` - Renders ContentPage slug "return-policy" (create page in Admin → Content Pages)
- `/$countryCode/faqs` - FAQ accordion grouped by category (page: `src/pages/faqs.tsx`)
- `/$countryCode/contact` - Contact form + info from FooterContent (page: `src/pages/contact.tsx`)
- `/$countryCode/blogs` - Blog listing (page: `src/pages/blogs.tsx`)
- `/$countryCode/blogs/$slug` - Full blog post (page: `src/pages/blog-post.tsx`)

## Customer Account System
- Auth: JWT-based via Medusa SDK (`sdk.auth.*`, `sdk.store.customer.*`)
- Context: `CustomerProvider` in `src/lib/context/customer.tsx` wraps layout
- Hook: `useCustomer()` returns `{ customer, isAuthenticated, isLoading, logout, refetch }`
- Header: `AccountDropdown` component in navbar (sign-in/sign-up when logged out, profile menu when logged in)
- Route guard: `/$countryCode/account.tsx` redirects unauthenticated users to login
- Pages:
  - `/$countryCode/account/login` - Sign in (page: `src/pages/account/login.tsx`)
  - `/$countryCode/account/register` - Sign up (page: `src/pages/account/register.tsx`)
  - `/$countryCode/account/profile` - Edit profile (page: `src/pages/account/profile.tsx`)
  - `/$countryCode/account/orders` - Order history (page: `src/pages/account/orders.tsx`)
  - `/$countryCode/account/orders/$orderId` - Order detail (page: `src/pages/account/order-detail.tsx`)
  - `/$countryCode/account/addresses` - Address CRUD (page: `src/pages/account/addresses.tsx`)
- Shared layout: `AccountLayout` component with sidebar nav (`src/components/account-layout.tsx`)

## Admin Widgets
- `src/admin/widgets/top-seller-toggle.tsx` - Product detail widget to toggle "Is Top Seller" and set sort order
- `src/admin/widgets/product-vto-image.tsx` - Product detail widget to select VTO image from product images gallery (sets `metadata.vto_image_url`)

## Module Links
- `src/links/product-top-seller.ts` - Links Product to TopSeller (one-to-one, cascade delete)
- `src/links/customer-phone.ts` - Links Customer to CustomerPhone (one-to-one, cascade delete)

## Top Sellers System
- TopSeller module stores product_id (unique), sort_order, is_active
- Admin widget on product detail page allows toggling top seller status and sort order
- Store API `/store/top-sellers` returns products with calculated prices sorted by sort_order
- Homepage component: `src/components/top-sellers.tsx` (Swiper carousel for >4 items, static grid for <=4)
- Uses `QueryContext` for pricing context in query.graph

## Client Diaries System
- ClientDiary module: image_url, title (nullable), caption (nullable), sort_order, is_active
- Admin page with image upload via `sdk.admin.upload.create()` (uses R2 storage), bulk upload, toggle/edit/delete
- Store API `/store/client-diaries` returns active entries sorted by sort_order
- Homepage component: `src/components/client-diaries.tsx` (polaroid-style cards with rotation, lightbox on click)

## Client Feedback System
- ClientFeedback module: image_url, customer_name, platform (enum: whatsapp/instagram), caption (nullable), sort_order, is_active
- Admin page with image upload via R2, bulk upload, platform selector, toggle/edit/delete
- Store API `/store/client-feedback` returns active entries sorted by sort_order
- Homepage component: `src/components/client-feedback.tsx` (CSS columns masonry, platform badges, lightbox on click)

## Razorpay Payment Integration
- Custom payment provider at `src/modules/razorpay/` (extends AbstractPaymentProvider)
- Provider ID: `pp_razorpay_razorpay`
- Registered conditionally in `medusa-config.ts` (only if `RAZORPAY_KEY_ID` env var is set)
- Env vars needed: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (optional)
- Signature verification route: `POST /store/razorpay/authorize`
- Webhook URL: `/hooks/payment/razorpay_razorpay`
- Storefront: Razorpay checkout.js modal opens on "Pay with Razorpay" button click in review step
- Payment flow: initiatePayment creates Razorpay order -> frontend opens modal -> user pays -> signature verified -> cart completed
- Files modified: `payment-button.tsx` (RazorpayPaymentButton), `checkout.ts` (isRazorpay util), `payment-methods.tsx` (icon/title)
- Must enable provider in India region via Admin > Settings > Regions after env vars are set

## Virtual Try-On System
- Extends the `SiteSettings` module (no separate module) with fields: `virtual_tryon_html` (text, nullable), `virtual_tryon_bg_image_url` (text, nullable)
- Admin: `src/admin/routes/site-settings/page.tsx` has Virtual Try-On section — paste HTML, upload background image, save
- Store API `/store/site-settings` returns `virtual_tryon_html` and `virtual_tryon_bg_image_url`
- Homepage section: `src/components/virtual-tryon.tsx` - anchor `id="virtual-tryon"`, renders premium banner with "Show Virtual Try-On" button, opens fullscreen overlay with `TryOnFrame` (srcdoc iframe, camera+mic permissions)

## Kling AI Virtual Try-On Playground
- Custom module: `src/modules/vto` — service key `vto`, models: `VtoSession`, `VtoUploadedPhoto`
- Route: `/$countryCode/virtual-try-on` — shows full VTO page (route: `src/routes/$countryCode/virtual-try-on.tsx` imports `VirtualTryOnPage` from `src/pages/virtual-try-on.tsx`)
- Navbar "Virtual Try-On" link points to this page (replaces old `scrollToVirtualTryon` scroll behavior)
- Backend API routes (all require customer auth):
  - `POST /store/vto/upload-photo` — multipart file upload → R2 → returns `photo_url`
  - `POST /store/vto/submit` — creates VtoSession, calls Kling API (`api.piapi.ai`), returns `task_id` + `session_id`
  - `GET /store/vto/status?task_id=&session_id=` — polls Kling, re-uploads result to R2, updates session
  - `GET /store/vto/history` — returns last 20 sessions for customer
  - `DELETE /store/vto/history` — soft-deletes all sessions for customer
  - `POST /store/vto/save` — sets `saved=true` on a session
- Env var: `KLING_API_KEY` — backend only, read server-side from `process.env`
- Polling: 3s interval, max 40 retries (2 min), then `timed_out`; result image re-uploaded to R2 (3 retries)
- Section is hidden (returns null) when `virtual_tryon_html` is null/empty
- Navigation: `scrollToVirtualTryon(countryCode, navigate?)` exported from `src/pages/home.tsx` - smooth-scrolls on homepage, uses `sessionStorage("scrollToVirtualTryon")` + redirect for cross-page
- Navbar pink "Virtual Try-On" button calls `scrollToVirtualTryon` (both desktop + mobile drawer)
- Hero section Virtual Try-On button also calls `scrollToVirtualTryon`
- **VTO Image Selection**: Admin widget at `src/admin/widgets/product-vto-image.tsx` displays product images grid with "Make VTO Image" button. Sets `product.metadata.vto_image_url` for custom VTO image. Storefront uses `getVtoImageUrl()` helper (priority: 1. `metadata.vto_image_url`, 2. second image, 3. first image, 4. thumbnail). Used in VTO page outfit grid and product page "Try Now" feature.

## Promo Popup System
- PromoPopup module: is_active, banner_image_url, top_label, main_heading, sub_text, button_text, button_link, footer_note, show_dont_show_again, delay_seconds, cooldown_hours
- Admin page at `src/admin/routes/promo-popup/page.tsx` - single record CRUD with image upload, all fields editable
- Store API `/store/promo-popup` returns active popup or null
- Homepage component: `src/components/promo-popup.tsx` - modal overlay with fade-in, localStorage cooldown key `fairyfrills_popup_dismissed`
- Mobile: bottom sheet. Desktop: centered modal. Dismiss on X, overlay click, or CTA click.

## Categories
- birthday-outfits: Birthday Outfits
- mother-daughter-combos: Mother & Daughter Combos
- seasonal: Seasonal (admin editable name)
- /themedresses: Theme Dresses

## FeaturedCategories (Shop by Category Section) — LUXURY REDESIGNED
- Fully dynamic — fetches all root-level categories from `/store/product-categories`
- No hardcoded category list or order. Displays ALL categories automatically.
- **Cinematic Design**: Tall portrait cards (500-520px height, 360px width) with rounded-3xl corners, pink glow shadow on hover
- **Visual Features**:
  - Full background image with smooth zoom effect on hover
  - Unique color tint overlay per category (lavender, blush pink, golden, fairy purple)
  - Dark-to-transparent gradient overlay that deepens on hover
  - Top left: glowing pill badge with category tagline in white italic text
  - Bottom: large white serif category name (3xl/4xl) + "Shop Now" pill button with arrow
  - "Shop Now" button transitions to solid pink fill with glow shadow on hover
  - Floating sparkle particle animation in background (20 particles with rotation and fade)
- **Section Heading**: Pink uppercase "OUR COLLECTIONS" eyebrow + serif "Shop by Category" heading + decorative sparkle divider below
- **Layout**: Always horizontal carousel (snap-center) with fade gradients on edges, 6-8 gap between cards
- Images: `category.metadata.thumbnail` (set via Admin > Categories > Edit > Metadata). Falls back to CDN images for the original 3 categories if metadata is null.
- Subtitle text: `category.metadata.subtitle` (optional, falls back to hardcoded per-handle subtitle for original 3).
- Fallback images + tints stored in `CATEGORY_FALLBACKS` const in `src/pages/home.tsx`
- New categories added in Admin auto-appear; set `metadata.thumbnail` to add a cover image

## OTP Authentication System (CURRENT — simplified)
- Only login method: Email OTP or Phone OTP — NO passwords, NO registration form
- `/account/login` — single page with Email OTP tab + Phone OTP tab (page: `src/pages/account/login.tsx`)
- `/account/register` — redirects to `/account/login` (no separate registration flow)
- OTP flow: enter email/phone → OTP sent → enter 6 digits → verified → auto-creates account if new, logs in if existing
- Email OTP backend: `POST /store/otp/email/send` + `POST /store/otp/email/verify` (unauthenticated)
- Phone OTP backend: `POST /store/otp/phone/send` (MSG91 SMS) + `POST /store/otp/phone/verify` (unauthenticated)
- Phone customers get `phone: +91XXXXXXXXXX` + placeholder email `phone_XXXXXXXXXX@fairyfrills.internal`
- OtpRecord uses `customer_id` field as identifier prefix: `email:<email>` or `phone:<10-digit>`
- SMS provider: MSG91 via env vars `MSG91_API_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`
- Security: 10-min OTP expiry, 3 max attempts, 10-min lockout, 60-sec resend rate limit
- JWT token returned by verify routes, set via `sdk.client.setToken(token)`
- CustomerPhone module still exists for storing verified phone data (legacy — not required for login)

## Checkout Auth Guard
- Checkout (`src/pages/checkout.tsx`) checks auth via `useCustomer()` only — NO phone verify step
- Unauthenticated users → redirected to `/$countryCode/account/login?redirect=<checkout-url>`
- After OTP login → directly to address step, no extra verification
- Login page handles the `redirect` search param to send users back to checkout after auth
- Browse freely (home, categories, products, cart) without login — only checkout requires auth

## Address Auto-Save
- After order completion, `saveShippingAddressToAccount()` in `use-checkout.ts` deduplicates and saves the shipping address to the logged-in customer's account
- `checkout-address-step.tsx` auto-fills the first saved customer address when the cart has no address yet

## Admin Seeding
- Admin user `admin@fairyfrills.com` / `admin123` is seeded in `src/migration-scripts/25022026-initial-seed.ts` via `seedAdminUser()`
- Seed script also at `src/scripts/seed-admin.ts`, run with `pnpm seed:admin`
- Seeding is idempotent (checks if user exists before creating)

## Product Listing
- Category pages use `useAllProducts` hook (limit 500, no pagination) from `src/lib/hooks/use-products.ts`
- No "Load More" button - all products shown at once
