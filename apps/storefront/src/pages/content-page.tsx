import PageBanner from "@/components/page-banner"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"

const ContentPageView = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["content-page", slug],
    queryFn: () => sdk.client.fetch<{ page: { title: string; content: string } }>(`/store/pages/${slug}`),
  })

  const page = data?.page

  if (isLoading) {
    return (
      <div>
        <div className="bg-[var(--color-primary)] py-12 md:py-16">
          <div className="content-container text-center">
            <div className="h-10 w-64 mx-auto bg-white/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="content-container py-12">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${80 - i * 8}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div>
        <PageBanner title="Page Not Found" />
        <div className="content-container py-12 text-center">
          <p className="text-[var(--color-text-light)]">The requested page could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBanner title={page.title} />
      <div className="content-container py-10 md:py-14">
        <div
          className="prose prose-pink max-w-none
            [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-[var(--color-text)] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:first:mt-0
            [&_h3]:font-serif [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-[var(--color-text)] [&_h3]:mb-3 [&_h3]:mt-6
            [&_p]:text-[var(--color-text-light)] [&_p]:leading-relaxed [&_p]:mb-4
            [&_strong]:text-[var(--color-text)]
            [&_ul]:text-[var(--color-text-light)] [&_ul]:space-y-2 [&_ul]:my-4 [&_ul]:pl-6
            [&_li]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}

export default ContentPageView
