import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Calley AI</h1>
          <div className="flex gap-4">
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Phone Ordering
          <br />
          <span className="text-blue-600">for Restaurants</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Never miss a phone order again. Calley AI answers your restaurant phone,
          takes orders naturally, and sends them straight to your kitchen.
        </p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-block"
        >
          Get Started Free
        </Link>
      </main>
    </div>
  );
}
