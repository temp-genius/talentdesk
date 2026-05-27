export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-primary-700 mb-3">TalentDesk</h1>
        <p className="text-xl text-gray-500 mb-8">
          The B2B marketplace connecting independent recruiters with hiring companies.
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          Coming soon
        </p>
      </div>
    </main>
  )
}
