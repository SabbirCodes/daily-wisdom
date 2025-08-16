"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Heart, Share2 } from "lucide-react"
import Link from "next/link"

interface Quote {
  id: number
  author: string
  content: string
  tags: string[]
  authorSlug: string
  length: number
  dateAdded: string
  dateModified: string
}

export default function QuotesPage() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorite-quotes")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("favorite-quotes", JSON.stringify(favorites))
  }, [favorites])

  const fetchRandomQuote = async () => {
    setLoading(true)
    try {
      // Generate random page number between 1-10 for variety
      const randomPage = Math.floor(Math.random() * 10) + 1
      const response = await fetch(`https://api.freeapi.app/api/v1/public/quotes?page=${randomPage}&limit=10`)
      const data = await response.json()

      if (data.success && data.data.data.length > 0) {
        // Pick a random quote from the results
        const randomIndex = Math.floor(Math.random() * data.data.data.length)
        setQuote(data.data.data[randomIndex])
      }
    } catch (error) {
      console.error("Error fetching quote:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = () => {
    if (!quote) return

    setFavorites((prev) => (prev.includes(quote.id) ? prev.filter((id) => id !== quote.id) : [...prev, quote.id]))
  }

  const shareQuote = async () => {
    if (!quote) return

    const text = `"${quote.content}" - ${quote.author}`
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inspiring Quote",
          text: text,
          url: url,
        })
      } catch (error) {
        console.log("Error sharing:", error)
        // Fallback to clipboard if share fails
        await copyToClipboard(text)
      }
    } else {
      // Fallback to clipboard for browsers without Web Share API
      await copyToClipboard(text)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Simple feedback - you could enhance this with a toast notification
      const button = document.activeElement as HTMLButtonElement
      const originalText = button.textContent
      button.textContent = "Copied!"
      setTimeout(() => {
        if (button.textContent === "Copied!") {
          button.textContent = originalText
        }
      }, 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  useEffect(() => {
    fetchRandomQuote()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Daily Wisdom</h1>
          <p className="text-muted-foreground text-lg">Discover inspiring quotes to brighten your day</p>
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
              <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                <div className="text-center space-y-8">
                  {/* Quote Content */}
                  <motion.blockquote
                    className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed text-foreground font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    "{quote.content}"
                  </motion.blockquote>

                  {/* Author */}
                  <motion.cite
                    className="block font-sans text-lg md:text-xl text-muted-foreground not-italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    — {quote.author}
                  </motion.cite>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex items-center justify-center gap-4 pt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Button
                      onClick={toggleFavorite}
                      variant="outline"
                      size="lg"
                      className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(quote.id) ? "fill-current text-red-500" : ""}`} />
                      {favorites.includes(quote.id) ? "Favorited" : "Favorite"}
                    </Button>

                    <Button
                      onClick={shareQuote}
                      variant="outline"
                      size="lg"
                      className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>

                    <Link href="/favorites">
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors bg-transparent"
                      >
                        <Heart className="w-5 h-5" />
                        Favorites ({favorites.length})
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </Card>
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
          <Button
            onClick={fetchRandomQuote}
            disabled={loading}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
              </motion.div>
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            {loading ? "Finding Wisdom..." : "New Quote"}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="text-center mt-16 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-sm">
            Quotes powered by{" "}
            <a
              href="https://api.freeapi.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              FreeAPI
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
