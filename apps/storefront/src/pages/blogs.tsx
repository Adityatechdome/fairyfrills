import PageBanner from "@/components/page-banner"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

type BlogPost = {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  excerpt: string
  author: string
  published_at: string | null
}

const BlogsPage = ({ countryCode }: { countryCode: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => sdk.client.fetch<{ posts: BlogPost[] }>("/store/blogs"),
  })

  const posts = data?.posts || []

  return (
    <div>
      <PageBanner title="Blogs" />

      <div className="content-container py-10 md:py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-[var(--color-text-light)]">No blog posts available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/${countryCode}/blogs/${post.slug}` as string}
                className="group"
              >
                <div className="overflow-hidden rounded-xl mb-4">
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full aspect-[16/10] bg-[var(--color-primary-50)] flex items-center justify-center">
                      <span className="text-[var(--color-primary)] text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-light)] mb-2">
                  {post.author && <span>{post.author}</span>}
                  {post.author && post.published_at && <span className="w-1 h-1 rounded-full bg-[var(--color-text-light)]" />}
                  {post.published_at && (
                    <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </div>
                <h3 className="font-serif text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[var(--color-text-light)] line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogsPage
