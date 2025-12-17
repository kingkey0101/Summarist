import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlights - Summarist",
  description: "View your book highlights and notes",
};

export default function HighlightsPage() {
  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Highlights
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="No highlights"
              >
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No highlights yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start reading books and highlight important passages to see them
              here.
            </p>
            <a
              href="/for-you"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Explore Books
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
