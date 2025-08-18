"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ArrowLeft, Trash2, Copy } from "lucide-react";
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

export default function FavoritesPage() {
  const [favoriteQuotes, setFavoriteQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedQuotes, setCopiedQuotes] = useState<Set<number>>(new Set()); // Track copied state per quote

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = localStorage.getItem("favorite-quotes");
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(favoriteIds);

        // Fetch quotes for each favorite ID
        const quotes: Quote[] = [];
        for (const id of favoriteIds) {
          try {
            // Search for the quote by ID across multiple pages
            let found = false;
            for (let page = 1; page <= 20 && !found; page++) {
              const response = await fetch(
                `https://api.freeapi.app/api/v1/public/quotes?page=${page}&limit=10`
              );
              const data = await response.json();

              if (data.success && data.data.data.length > 0) {
                const quote = data.data.data.find((q: Quote) => q.id === id);
                if (quote) {
                  quotes.push(quote);
                  found = true;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching quote ${id}:`, error);
          }
        }
        setFavoriteQuotes(quotes);
      }
      setLoading(false);
    };

    loadFavorites();
  }, []);

  const removeFavorite = (quoteId: number) => {
    const updatedFavorites = favorites.filter((id) => id !== quoteId);
    setFavorites(updatedFavorites);
    setFavoriteQuotes((prev) => prev.filter((quote) => quote.id !== quoteId));
    localStorage.setItem("favorite-quotes", JSON.stringify(updatedFavorites));
  };

  const shareQuote = async (quote: Quote) => {
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
        await copyToClipboard(text, quote.id);
      }
    } else {
      await copyToClipboard(text, quote.id);
    }
  };

  const copyToClipboard = async (text: string, quoteId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuotes(prev => new Set(prev).add(quoteId));
      setTimeout(() => {
        setCopiedQuotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(quoteId);
          return newSet;
        });
      }, 2500);
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

      setCopiedQuotes(prev => new Set(prev).add(quoteId));
      setTimeout(() => {
        setCopiedQuotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(quoteId);
          return newSet;
        });
      }, 2500);
    }
  };

  // Copies the quote to clipboard
  const copyQuote = async (quote: Quote) => {
    const text = `"${quote.content}" - ${quote.author}`;
    await copyToClipboard(text, quote.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 text-slate-700 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Quotes
              </button>
            </Link>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Your Favorite Quotes
          </h1>
          <p className="text-slate-600 text-lg">
            {favoriteQuotes.length} saved quotes to inspire you
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Loading your favorite quotes...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && favoriteQuotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              No favorites yet
            </h2>
            <p className="text-slate-600 mb-6">
              Start adding quotes to your favorites to see them here
            </p>
            <Link href="/">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Discover Quotes
              </button>
            </Link>
          </motion.div>
        )}

        {/* Favorite Quotes Grid */}
        <AnimatePresence>
          <div className="grid gap-6">
            {favoriteQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="space-y-6">
                    {/* Quote Content */}
                    <blockquote className="font-serif text-xl md:text-2xl leading-relaxed text-slate-900 font-semibold">
                      &ldquo;{quote.content}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <cite className="block font-sans text-lg text-slate-600 not-italic">
                      — {quote.author}
                    </cite>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => shareQuote(quote)}
                          className="hidden md:flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => copyQuote(quote)}
                          className="flex items-center text-sm gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-transparent hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                        >
                          <Copy className="h-4 w-4 sm:w-5 sm:h-5" />
                          {copiedQuotes.has(quote.id) ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <button
                        onClick={() => removeFavorite(quote.id)}
                        className="flex items-center text-sm gap-2 px-4 py-2 border border-red-300 rounded-lg bg-transparent hover:bg-red-50 text-red-600 font-medium"
                      >
                        <Trash2 className="h-4 w-4 sm:w-5 sm:h-5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}