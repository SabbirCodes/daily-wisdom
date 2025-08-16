"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Heart, Share2, Copy } from "lucide-react";
import Link from "next/link";

interface Quote {
  id: number;
  author: string;
  content: string;
  tags: string[];
  authorSlug: string;
  length: number;
  dateAdded: string;
  dateModified: string;
}

export default function QuotesPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorite-quotes");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favorite-quotes", JSON.stringify(favorites));
  }, [favorites]);

  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      // Generate random page number between 1-10 for variety
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const response = await fetch(
        `https://api.freeapi.app/api/v1/public/quotes?page=${randomPage}&limit=10`
      );
      const data = await response.json();

      if (data.success && data.data.data.length > 0) {
        // Pick a random quote from the results
        const randomIndex = Math.floor(Math.random() * data.data.data.length);
        setQuote(data.data.data[randomIndex]);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!quote) return;

    setFavorites((prev) =>
      prev.includes(quote.id)
        ? prev.filter((id) => id !== quote.id)
        : [...prev, quote.id]
    );
  };

  const shareQuote = async () => {
    if (!quote) return;

    const text = `"${quote.content}" - ${quote.author}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inspiring Quote",
          text: text,
          url: url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
        // Fallback to clipboard if share fails
        await copyToClipboard(text);
      }
    } else {
      // Fallback to clipboard for browsers without Web Share API
      await copyToClipboard(text);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);

      // Fallback method
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const copyQuote = async (quote: Quote) => {
    const text = `"${quote.content}" - ${quote.author}`;
    await copyToClipboard(text);
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl mx-auto">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-12 lg:px-58 xl:px-64 py-3 shadow-md"
        >
          <Link href="/">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 hover:text-emerald-600 transition-colors">
              Daily Wisdom
            </h2>
          </Link>

          <Link href="/favorites">
            <button className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-md">
              <Heart className="w-4 h-4 md:hidden" />
              <span className="hidden sm:inline">Favorites</span>
              <span className="bg-emerald-500 text-xs px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            </button>
          </Link>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-16 mb-8 sm:mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Daily Words of Wisdom
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Find wisdom and inspiration for your daily journey
          </p>
        </motion.div>

        {/* Quote Card */}
        <AnimatePresence mode="wait">
          {quote && (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="p-4 sm:p-8 md:p-12 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl">
                <div className="text-center space-y-4">
                  {/* Quote Content */}
                  <motion.blockquote
                    className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed text-slate-900 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    &ldquo;{quote.content}&rdquo;
                  </motion.blockquote>

                  <motion.cite
                    className="block font-sans text-base sm:text-lg md:text-xl text-slate-600 not-italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    — {quote.author}
                  </motion.cite>

                  <motion.div
                    className="flex items-center justify-center gap-3 sm:gap-4 pt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <button
                      onClick={toggleFavorite}
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 hover:text-slate-900 transition-colors text-slate-700 font-medium"
                    >
                      <Heart
                        className={`h-4 w-4 sm:w-5 sm:h-5 ${
                          favorites.includes(quote.id)
                            ? "fill-current text-red-500"
                            : ""
                        }`}
                      />
                      {favorites.includes(quote.id) ? "Favorited" : "Favorite"}
                    </button>

                    <button
                      onClick={shareQuote}
                      className="hidden md:flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 hover:text-slate-900 transition-colors text-slate-700 font-medium"
                    >
                      <Share2 className="h-4 w-4 sm:w-5 sm:h-5" />
                      Share
                    </button>
                    <button
                      onClick={() => copyQuote(quote)}
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 hover:text-slate-900 transition-colors text-slate-700 font-medium"
                    >
                      <Copy className="h-4 w-4 sm:w-5 sm:h-5" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Quote Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <button
            onClick={fetchRandomQuote}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {loading ? "Finding Wisdom..." : "New Quote"}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="text-center mt-16 text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-xs text-slate-400">
            Wisdom flows where hearts are open
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
