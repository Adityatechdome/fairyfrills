import FaqsPage from "@/pages/faqs"
import { generateFAQSchema } from "@/lib/utils/structured-data"
import { createFileRoute } from "@tanstack/react-router"

// Representative static FAQs for structured data (rendered FAQs are dynamic from the API)
const STATIC_FAQS_FOR_SCHEMA = [
  { question: "What sizes are available for baby girl dresses?", answer: "We offer sizes from newborn (0-3 months) up to 8 years. Each product listing includes a detailed size chart to help you find the perfect fit." },
  { question: "Do you offer mother-daughter matching outfits?", answer: "Yes! We specialise in handcrafted mother-daughter twinning sets. You can browse our Mother Daughter Combos collection for coordinated outfits in adult and children sizes." },
  { question: "Can I customise a dress for my child?", answer: "Absolutely. We accept customisation requests for colour, embellishments, and sizing. Please contact us via WhatsApp or the Contact page with your requirements." },
  { question: "How long does delivery take?", answer: "Standard delivery across India takes 5–7 business days. Express shipping options are available at checkout. International orders may take 10–15 business days." },
  { question: "What is your return and exchange policy?", answer: "We accept returns and exchanges within 7 days of delivery for unused items in original packaging. Customised orders are non-returnable unless defective." },
  { question: "How do I care for the dresses?", answer: "Most of our dresses are best hand-washed in cold water or machine-washed on a gentle cycle. Care instructions are included on the garment label." },
]

export const Route = createFileRoute("/$countryCode/faqs")({
  head: () => {
    const title = "FAQs | Fairy Frills"
    const description = "Find answers to frequently asked questions about Fairy Frills dresses, shipping, customization, and more."
    const faqSchema = generateFAQSchema(STATIC_FAQS_FOR_SCHEMA)

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: "https://fairyfrills.in/in/faqs" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
      ],
    }
  },
  component: FaqsPage,
})
