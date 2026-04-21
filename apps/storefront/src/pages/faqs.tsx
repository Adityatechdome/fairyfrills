import PageBanner from "@/components/page-banner"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 text-[var(--color-primary)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[var(--color-border-light)]">
      <button
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors pr-4">
          {question}
        </span>
        <ChevronIcon open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[var(--color-text-light)] leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  )
}

const FaqsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => sdk.client.fetch<{ faqs: Record<string, Array<{ id: string; question: string; answer: string }>> }>("/store/faqs"),
  })

  const faqGroups = data?.faqs || {}

  return (
    <div>
      <PageBanner
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about our Dresses, Delivery, Customization, and more!"
      />

      <div className="content-container py-10 md:py-14">
        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : Object.keys(faqGroups).length === 0 ? (
          <p className="text-center text-[var(--color-text-light)]">No FAQs available at the moment.</p>
        ) : (
          <div className="max-w-3xl mx-auto space-y-10">
            {Object.entries(faqGroups).map(([category, faqs]) => (
              <div key={category}>
                <h2 className="font-serif text-xl md:text-2xl text-[var(--color-text)] mb-2">{category}</h2>
                <div className="w-12 h-0.5 bg-[var(--color-primary)] mb-4" />
                <div>
                  {faqs.map((faq) => (
                    <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FaqsPage
