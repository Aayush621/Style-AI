"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, Upload, Sparkles } from "lucide-react"

interface HeroSectionProps {
  onSearch: (query: string, type: "text" | "image", file?: File) => void
  onQuizClick: () => void
  loading: boolean
}

export default function HeroSection({ onSearch, onQuizClick, loading }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Add error state
  const [error, setError] = useState<string | null>(null)

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors
    if (searchQuery.trim()) {
      onSearch(searchQuery, "text")
    }
  }

  const handleFileUpload = (file: File) => {
    setError(null) // Clear previous errors
    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("Image file is too large. Please choose a file under 10MB.")
        return
      }
      onSearch("", "image", file)
    } else {
      setError("Please upload a valid image file (JPG, PNG, GIF, etc.)")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Discover Your Perfect Style with <span style={{ color: "#8c5a6e" }}>AI-Powered</span> Fashion
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Get personalized outfit recommendations tailored to your style, occasion, and preferences. Let our AI fashion
          stylist help you look your best.
        </p>

        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleTextSearch} className="relative max-w-2xl mx-auto">
            <div
              className={`relative flex items-center bg-white rounded-full shadow-lg border-2 transition-colors ${
                dragActive ? "border-purple-400 bg-purple-50" : "border-gray-200"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for? (e.g., 'summer dress for work')"
                className="flex-1 px-6 py-4 text-lg rounded-full focus:outline-none"
                disabled={loading}
              />

              <div className="flex items-center space-x-2 pr-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: "#8c5a6e" }}
                  disabled={loading}
                >
                  <Upload className="h-6 w-6" />
                </button>

                <button
                  type="submit"
                  className="p-3 rounded-full text-white transition-colors"
                  style={{ backgroundColor: "#8c5a6e" }}
                  disabled={loading || !searchQuery.trim()}
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </form>

          {dragActive && <p className="text-sm text-purple-600 mt-2">Drop your image here to search by style</p>}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onQuizClick}
            className="flex items-center space-x-2 px-8 py-4 text-white rounded-full font-semibold transition-all hover:shadow-lg transform hover:scale-105"
            style={{ backgroundColor: "#8c5a6e" }}
            disabled={loading}
          >
            <Sparkles className="h-5 w-5" />
            <span>Take Style Quiz</span>
          </button>

          <button
            className="px-8 py-4 border-2 rounded-full font-semibold transition-all hover:shadow-lg transform hover:scale-105"
            style={{ borderColor: "#8c5a6e", color: "#8c5a6e" }}
            disabled={loading}
          >
            Browse Recommendations
          </button>
        </div>
      </div>
    </section>
  )
}
