import PageBanner from "@/components/page-banner"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

const BlogPostPage = ({ slug, countryCode }: { slug: string; countryCode: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () =>
      sdk.client.fetch<{
        post: {
          title: string
          content: string
          author: string
          published_at: string | null
          thumbnail_url: string | null
        }
      }>(`/store/blogs/${slug}`),
  })

  const post = data?.post

  if (isLoading) {
    return (
      <div>
        <div className="bg-[var(--color-primary)] py-12 md:py-16">
          <div className="content-container text-center">
            <div className="h-10 w-80 mx-auto bg-white/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="content-container py-12 max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${90 - i * 5}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <PageBanner title="Post Not Found" />
        <div className="content-container py-12 text-center">
          <p className="text-[var(--color-text-light)]">The requested blog post could not be found.</p>
          <Link to={`/${countryCode}/blogs` as string} className="inline-block mt-4 text-sm text-[var(--color-primary)] hover:underline">
            Back to Blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBanner title={post.title} />

      <div className="content-container py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-light)] mb-6">
            {post.author && <span>By {post.author}</span>}
            {post.author && post.published_at && <span className="w-1 h-1 rounded-full bg-[var(--color-text-light)]" />}
            {post.published_at && (
              <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
          </div>

          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full rounded-xl mb-8 aspect-[16/9] object-cover"
            />
          )}

          <div
            className="prose prose-pink max-w-none
              [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-[var(--color-text)] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:first:mt-0
              [&_h3]:font-serif [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-[var(--color-text)] [&_h3]:mb-3 [&_h3]:mt-6
              [&_p]:text-[var(--color-text-light)] [&_p]:leading-relaxed [&_p]:mb-4
              [&_strong]:text-[var(--color-text)]
              [&_ul]:text-[var(--color-text-light)] [&_ul]:space-y-2 [&_ul]:my-4 [&_ul]:pl-6
              [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 pt-6 border-t border-[var(--color-border-light)]">
            <Link
              to={`/${countryCode}/blogs` as string}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
            >
              &larr; Back to all posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostPage
