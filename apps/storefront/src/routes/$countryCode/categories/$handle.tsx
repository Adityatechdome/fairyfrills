import { createFileRoute, notFound } from "@tanstack/react-router"
import { retrieveCategory } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import Category from "@/pages/category"
import { HttpTypes } from "@medusajs/types"
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/utils/structured-data"

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  "birthday-outfits": {
    title: "Handcrafted Birthday Dresses for Girls | Fairy Frills India",
    description: "Shop handcrafted birthday outfits for baby girls — princess frocks, tutu dresses & theme birthday wear. India-made, celebration-ready. Free shipping available.",
  },
  "mother-daughter-combos": {
    title: "Mother Daughter Matching Outfits & Twinning Sets | Fairy Frills",
    description: "Explore handcrafted mother daughter twinning dresses for birthdays, festivals & photoshoots. Coordinated sets made in India. Shop now at Fairy Frills.",
  },
  "seasonal": {
    title: "Summer & Seasonal Dresses for Baby Girls | Fairy Frills India",
    description: "Shop our seasonal collection of handcrafted summer dresses for baby girls. Light fabrics, beautiful designs, made in India. New arrivals every season.",
  },
  "princess-dresses": {
    title: "Princess Dresses for Girls — Handcrafted Party Wear | Fairy Frills",
    description: "Shop handcrafted princess dresses for baby girls. Perfect for birthdays, theme parties & special occasions. India-made with premium fabrics.",
  },
  "first-birthday": {
    title: "First Birthday Outfits for Baby Girls | Fairy Frills India",
    description: "Make the 1st birthday unforgettable with handcrafted first birthday frocks for baby girls. Premium fabrics, beautiful designs, made in India.",
  },
  "festive-wear": {
    title: "Festive Wear for Girls — Lehenga, Frocks & More | Fairy Frills",
    description: "Explore Fairy Frills\' festive wear collection for baby girls. Handcrafted lehengas, anarkalis & festive frocks for Diwali, Navratri & weddings.",
  },
  "unicorn-theme": {
    title: "Unicorn Birthday Dresses for Girls | Fairy Frills India",
    description: "Shop magical unicorn theme birthday dresses for baby girls. Handcrafted tutu frocks, pastel party wear & unicorn outfits made in India.",
  },
  "barbie-theme": {
    title: "Barbie Theme Birthday Outfits for Girls | Fairy Frills",
    description: "Dress her up in a gorgeous Barbie theme birthday outfit. Handcrafted pink dresses, tutu sets & party wear for girls — made in India.",
  },
}

const CATEGORY_OG_IMAGES: Record<string, string> = {
  "birthday-outfits": "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg",
  "mother-daughter-combos": "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg",
}

const DEFAULT_OG_IMAGE = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg"

const CATEGORY_FAQS: Record<string, { question: string; answer: string }[]> = {
  "birthday-outfits": [
    {
      question: "What are the best birthday outfit styles for baby girls?",
      answer: "Fairy Frills offers princess frocks, tutu dresses, and theme birthday outfits — all handcrafted in India with premium fabrics perfect for any birthday celebration.",
    },
    {
      question: "Do you offer mother-daughter twinning outfits for birthdays?",
      answer: "Yes! We have beautifully coordinated mother-daughter twinning sets perfect for birthday photoshoots and celebrations. Shop our Mother Daughter Combos collection.",
    },
    {
      question: "Are first birthday dresses available?",
      answer: "Absolutely. We have a dedicated first birthday collection with smash cake outfits, floral frocks, and tutu sets — all handcrafted and made in India.",
    },
    {
      question: "Do you ship birthday dresses across India?",
      answer: "Yes, Fairy Frills ships handcrafted birthday dresses across India. Free shipping is available on select orders.",
    },
  ],
  "mother-daughter-combos": [
    {
      question: "What occasions are mother daughter matching outfits suitable for?",
      answer: "Our mother daughter twinning sets are perfect for birthdays, festivals, photoshoots, weddings, and family events. All pieces are handcrafted in India.",
    },
    {
      question: "Are the mother daughter sets customisable?",
      answer: "Yes, we offer customisation options for our twinning sets. Contact us via WhatsApp for bespoke orders and size adjustments.",
    },
  ],
  "first-birthday": [
    {
      question: "What should a baby girl wear for her first birthday?",
      answer: "A handcrafted tutu frock, floral dress, or princess gown makes the perfect first birthday outfit. Fairy Frills\' first birthday collection is designed for comfort and style.",
    },
    {
      question: "Do first birthday dresses come with accessories?",
      answer: "Some of our first birthday outfits include matching headbands or accessories. Check individual product listings for details.",
    },
  ],
}

const CATEGORY_INTRO: Record<string, string> = {
  "birthday-outfits": "Discover handcrafted birthday dresses for baby girls — from princess frocks and tutu sets to theme birthday outfits for unicorn, Barbie & fairytale parties. Every piece is made in India with premium fabrics, designed to make her birthday truly magical.",
  "mother-daughter-combos": "Create beautiful memories in perfectly coordinated mother-daughter twinning outfits. Our handcrafted matching sets are designed for birthdays, festivals, and special photoshoots — all made in India with love.",
  "first-birthday": "Celebrate her very first birthday in a handcrafted outfit made just for this moment. Our first birthday collection features tutu dresses, floral frocks, and princess gowns — all crafted in India with the softest fabrics.",
  "seasonal": "Refresh her wardrobe with our seasonal collection of handcrafted dresses for baby girls. Light fabrics, beautiful prints, and comfortable styles — new arrivals every season, made in India.",
  "festive-wear": "Dress her up for every festival in a stunning handcrafted outfit. From lehengas and anarkalis to festive frocks — our festive wear collection brings tradition and elegance together for baby girls.",
  "princess-dresses": "Every girl deserves to feel like a princess. Browse our handcrafted princess dresses — floor-length gowns, layered tutus, and sparkly party frocks made in India for your little royalty.",
  "unicorn-theme": "Make her birthday magical with a handcrafted unicorn theme dress. Pastel tutus, rainbow frocks, and sparkly unicorn outfits — all made in India and ready to make the party unforgettable.",
  "barbie-theme": "She\'ll be the star of the party in a handcrafted Barbie theme birthday outfit. Pretty in pink dresses, glamorous frocks, and Barbie-inspired party wear — made in India with premium fabrics.",
}

export const Route = createFileRoute("/$countryCode/categories/$handle")({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: async ({ params, context }): Promise<any> => {
    const { countryCode, handle } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region || !handle) {
      throw notFound()
    }

    const category = await queryClient.ensureQueryData({
      queryKey: ["category", handle],
      queryFn: async () => {
        try {
          return await retrieveCategory({ handle })
        } catch {
          throw notFound()
        }
      },
    })

    return {
      countryCode,
      region: region as unknown as HttpTypes.StoreRegion,
      category: category as unknown as HttpTypes.StoreProductCategory,
    }
  },
  head: ({ loaderData }) => {
    const { category, countryCode } = loaderData || {}
    const handle = category?.handle || ""
    const categoryName = category?.name || "Category"
    const cc = countryCode || "in"

    const seo = CATEGORY_SEO[handle]
    const title = seo?.title || `${categoryName} | Fairy Frills India`
    const description =
      seo?.description ||
      `Shop our ${categoryName.toLowerCase()} collection at Fairy Frills. Handcrafted designer outfits for baby girls — made in India.`

    const ogImage = CATEGORY_OG_IMAGES[handle] || DEFAULT_OG_IMAGE

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: `https://fairyfrills.in/${cc}` },
      { name: categoryName, url: `https://fairyfrills.in/${cc}/categories/${handle}` },
    ])

    const faqs = CATEGORY_FAQS[handle]
    const faqSchema = faqs ? generateFAQSchema(faqs) : null

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "640" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: `https://fairyfrills.in/${cc}/categories/${handle}` },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
        ...(faqSchema
          ? [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }]
          : []),
      ],
    }
  },
  component: Category,
})
