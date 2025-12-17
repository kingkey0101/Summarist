"use client";

import { useEffect } from "react";

export default function HelpPage() {
  useEffect(() => {
    document.title = "Help & Support - Summarist";
  }, []);
  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "You can create an account by clicking the 'Login' button and selecting 'Sign up'. We support email/password registration as well as Google sign-in.",
    },
    {
      question: "How do I upgrade to premium?",
      answer:
        "Go to the 'Choose Plan' section from the main menu to view our premium subscription options and upgrade your account.",
    },
    {
      question: "Can I listen to books offline?",
      answer:
        "Premium subscribers can download books for offline listening. Look for the download button on book pages.",
    },
    {
      question: "How do I add highlights?",
      answer:
        "While reading, select any text to highlight it. Your highlights will be saved to your 'Highlights' section for easy reference.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your premium subscription at any time from your account settings. You'll retain access until the end of your billing period.",
    },
    {
      question: "How many books can I save to my library?",
      answer:
        "There's no limit to how many books you can save to your library. Premium subscribers get unlimited access to our entire catalog.",
    },
  ];

  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Help & Support
        </h1>

        {/* Contact Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-900 mb-4">
            Need Help?
          </h2>
          <p className="text-green-800 mb-4">
            Can't find what you're looking for? Our support team is here to help
            you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@summarist.com"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Email"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email Support
            </a>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors"
              onClick={() => alert("Live chat feature coming soon!")}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Chat"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Live Chat
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={`faq-${faq.question.slice(0, 20).replace(/\s+/g, "-")}-${index}`}
                className="bg-white border border-gray-200 rounded-lg"
              >
                <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-900">
                  {faq.question}
                </summary>
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/choose-plan"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  role="img"
                  aria-label="Premium"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Upgrade to Premium
                </h4>
                <p className="text-sm text-gray-600">
                  Access unlimited books and features
                </p>
              </div>
            </a>

            <a
              href="/settings"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  role="img"
                  aria-label="Settings"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Account Settings</h4>
                <p className="text-sm text-gray-600">
                  Manage your account and preferences
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
