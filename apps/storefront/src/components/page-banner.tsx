const PageBanner = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <div className="bg-[var(--color-primary)] py-12 md:py-16">
      <div className="content-container text-center">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-white tracking-[0.04em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-white/90 text-sm md:text-base max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default PageBanner
