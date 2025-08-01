"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FiltersSection from "@/components/filters-section"
import RecommendationGrid from "@/components/recommendation-grid"
import StyleQuiz from "@/components/style-quiz"
import UserProfile from "@/components/user-profile"
import LoadingSpinner from "@/components/loading-spinner"

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    style: "",
    occasion: "",
  })

  const handleSearch = async (query: string, searchType: "text" | "image", imageFile?: File) => {
    setLoading(true)
    try {
      const endpoint =
        searchType === "text"
          ? "https://ldwaka4gw5.execute-api.us-east-1.amazonaws.com/prod/search/text-to-image"
          : "https://ldwaka4gw5.execute-api.us-east-1.amazonaws.com/prod/search/image-to-image"


      let response
      if (searchType === "text") {
        const requestData = {
          query_text: query,
        }

        console.log("Sending text search request:", requestData)

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        })
      } else {
        // Image search
        const formData = new FormData()
        if (imageFile) {
          formData.append("query_image", imageFile)
        }
        formData.append("limit", "20")
        if (filters.category) formData.append("category", filters.category)
        if (filters.style) formData.append("style", filters.style)
        if (filters.occasion) formData.append("occasion", filters.occasion)

        console.log("Sending image search request with file:", imageFile?.name)

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Full API Response:", data)

      // Handle your specific API response structure
      if (data.results && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} recommendations`)
        setRecommendations(data.results)
      } else {
        console.log("No results found in API response")
        setRecommendations([])
      }
    } catch (error) {
      console.error("Search failed:", error)
      setRecommendations([])
      // You could add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3ecd8" }}>
      <Header onProfileClick={() => setShowProfile(true)} onQuizClick={() => setShowQuiz(true)} />

      <main>
        <HeroSection onSearch={handleSearch} onQuizClick={() => setShowQuiz(true)} loading={loading} />

        <FiltersSection filters={filters} onFiltersChange={setFilters} />

        {loading && <LoadingSpinner />}

        <RecommendationGrid recommendations={recommendations} loading={loading} />
      </main>

      {showQuiz && (
        <StyleQuiz
          onClose={() => setShowQuiz(false)}
          onComplete={(preferences) => {
            console.log("Quiz completed:", preferences)
            setShowQuiz(false)
          }}
        />
      )}

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </div>
  )
}
