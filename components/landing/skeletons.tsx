export const FeaturedProductsSkeleton = () => (
  <section className="bg-gray-900 py-24">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-800" />
        <div className="mx-auto h-4 w-96 animate-pulse rounded bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-800 p-6 shadow-lg">
            <div className="mb-4 h-48 rounded-lg bg-gray-700" />
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-700" />
            <div className="mb-4 h-4 w-full rounded bg-gray-700" />
            <div className="h-10 rounded bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CategoriesSkeleton = () => (
  <section className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-20">
    <div className="container mx-auto px-4">
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-700" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-800" />
        ))}
      </div>
    </div>
  </section>
);

export const TechnologySkeleton = () => (
  <section className="overflow-hidden bg-gradient-to-b from-black via-gray-950 to-gray-900 py-24">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-gray-800" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-800" />
            ))}
          </div>
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-gray-800" />
      </div>
    </div>
  </section>
);

export const ArgentinaSkeleton = () => (
  <section className="bg-gradient-to-b from-gray-900 via-gray-950 to-black py-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto h-64 w-full max-w-2xl animate-pulse rounded-2xl bg-gray-800" />
    </div>
  </section>
);

export const FooterSkeleton = () => (
  <footer className="bg-gradient-to-b from-black via-gray-950 to-gray-900 py-16">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-800" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-4 w-32 animate-pulse rounded bg-gray-700" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </footer>
);
