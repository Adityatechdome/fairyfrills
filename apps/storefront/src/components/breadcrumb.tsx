import { Link } from "@tanstack/react-router"
import { ChevronRight } from "@medusajs/icons"

type BreadcrumbItem = {
  label: string
  href?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-light)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="w-3 h-3 flex-shrink-0 opacity-50"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className={isLast ? "font-medium text-[var(--color-text)] truncate max-w-[180px] sm:max-w-xs" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href as any}
                  params={item.params}
                  className="hover:text-[var(--color-primary)] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
