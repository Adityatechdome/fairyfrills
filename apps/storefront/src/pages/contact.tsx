import PageBanner from "@/components/page-banner"
import { sdk } from "@/lib/utils/sdk"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState } from "react"

const ContactPage = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  })
  const [success, setSuccess] = useState(false)

  const { data: footerData } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => sdk.client.fetch<any>("/store/footer"),
    staleTime: 60000,
  })

  const footer = footerData?.footer

  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/store/contact", { method: "POST", body: form }),
    onSuccess: () => {
      setSuccess(true)
      setForm({ first_name: "", last_name: "", email: "", phone: "", country: "", message: "" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const inputClasses =
    "w-full px-4 py-3 border border-[var(--color-border-light)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[color:var(--color-placeholder)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"

  return (
    <div>
      <PageBanner title="Contact Us" />

      <div className="content-container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left - Contact Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--color-heading)] mb-2">
                Get in Touch
              </h2>
              <div className="w-12 h-0.5 bg-[var(--color-primary)] mb-4" />
              <p className="text-[var(--color-text-light)] text-sm leading-relaxed">
                Have a question about our dresses or need help with your order? We'd love to hear from you. Reach out and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              {footer?.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Email</p>
                    <a href={`mailto:${footer.email}`} className="text-sm text-[var(--color-primary)] hover:underline">{footer.email}</a>
                  </div>
                </div>
              )}

              {footer?.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Phone</p>
                    <a href={`tel:${footer.phone}`} className="text-sm text-[var(--color-primary)] hover:underline">{footer.phone}</a>
                  </div>
                </div>
              )}

              {footer?.operational_hours && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Hours</p>
                    <p className="text-sm text-[var(--color-text-light)]">{footer.operational_hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Contact Form */}
          <div>
            {success ? (
              <div className="bg-[var(--color-primary-50)] rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[var(--color-text)] mb-2">Thank You!</h3>
                <p className="text-sm text-[var(--color-text-light)] mb-4">
                  Your message has been sent successfully. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name *"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClasses}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <textarea
                  placeholder="Your Message *"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClasses} resize-none`}
                />
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-3 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm tracking-[0.06em] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
                >
                  {mutation.isPending ? "Sending..." : "Send Message"}
                </button>
                {mutation.isError && (
                  <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
