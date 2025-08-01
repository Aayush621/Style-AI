"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Share2 } from "lucide-react"

// Updated interface to match your API response
interface RecommendationItem {
  rank?: number
  productIdStr: string
  name: string
  category: string
  score?: number
  imageUrl: string
  // Optional fields for display
  brand?: string
  price?: string
  style?: string
  occasion?: string
}

interface RecommendationGridProps {
  recommendations: RecommendationItem[]
  loading: boolean
}

export default function RecommendationGrid({ recommendations, loading }: RecommendationGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Mock data for demonstration (when no API results)
  const mockRecommendations: RecommendationItem[] = [
    {
      productIdStr: "mock-1",
      name: "Elegant Summer Dress",
      category: "Dresses",
      imageUrl: "https://img.ltwebstatic.com/images3_pi/2024/03/18/c0/1710756071e42f88aed80058b79e38b548705bdf14_wk_1722531903_thumbnail_720x.jpg",
      brand: "StyleCo",
      price: "$299.99",
      style: "Casual",
      occasion: "Weekend",
    },
    {
      productIdStr: "mock-2",
      name: "Professional Blazer",
      category: "Outerwear",
      imageUrl: "https://blackberrys.com/cdn/shop/files/Techpro_Formal_Blue_Stripe_Blazer_Kuma-CJ002489B2-techprofeatureimage.jpg?v=1741245061",
      brand: "WorkWear",
      price: "$499.99",
      style: "Business",
      occasion: "Work",
    },
    {
      productIdStr: "mock-3",
      name: "Casual Denim Jacket",
      category: "Outerwear",
      imageUrl: "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/22874222/2023/8/21/040adafe-d963-434d-aaa3-42526b1bb8f51692615386361-HERENOW-Men-Jackets-9461692615385939-1.jpg",
      brand: "DenimCo",
      price: "$179.99",
      style: "Casual",
      occasion: "Weekend",
    },
    {
      productIdStr: "mock-4",
      name: "Sports Wear",
      category: "Sports Wear",
      imageUrl: "https://tiimg.tistatic.com/fp/1/008/234/shrink-resistance-mens-sports-wear-blue-white-plain-tracksuits-089.jpg",
      brand: "Elegance",
      price: "$219.99",
      style: "Sports",
      occasion: "Sports",
    },
  ]

  // Function to extract brand from product name
  const extractBrand = (name: string): string => {
    // Common patterns: "Brand Name Product" or "Brand Product Name"
    const words = name.split(" ")
    if (words.length >= 2) {
      // Take first 1-2 words as potential brand
      return words.slice(0, 2).join(" ")
    }
    return "Fashion Brand"
  }

  // Function to generate estimated price based on category
  const generatePrice = (category: string): string => {
    const priceRanges: { [key: string]: [number, number] } = {
      Apparel: [25, 150],
      Shirts: [30, 80],
      Dresses: [40, 200],
      Outerwear: [60, 300],
      Shoes: [50, 250],
      Accessories: [15, 100],
    }

    const range = priceRanges[category] || [30, 120]
    const price = Math.floor(Math.random() * (range[1] - range[0]) + range[0])
    return `$${price}.99`
  }

  // Normalize API data to display format
  const normalizeRecommendationData = (item: RecommendationItem): RecommendationItem => {
    console.log("Processing API item:", item) // Debug log

    return {
      ...item,
      // Use productIdStr as unique identifier
      productIdStr: item.productIdStr,
      // Use the exact name from API
      name: item.name,
      // Use the exact category from API
      category: item.category,
      // Use the exact imageUrl from API
      imageUrl: item.imageUrl,
      // Extract brand from name if not provided
      brand: item.brand || extractBrand(item.name),
      // Generate price if not provided
      price: item.price || generatePrice(item.category),
      // Default style and occasion if not provided
      style: item.style || "Trendy",
      occasion: item.occasion || "Casual",
    }
  }

  // Handle image loading errors
  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set([...prev, productId]))
  }

  // Determine what to display
  const displayRecommendations =
    recommendations.length > 0 ? recommendations.map(normalizeRecommendationData) : mockRecommendations

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Searching for recommendations...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" id="recommendations">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {recommendations.length > 0
            ? (
              <>
                AI Recommendations
                <div className="text-sm text-gray-600 mt-2">
                  Disclaimer : The results may have low resolution due to data quality constraints.
                </div>
              </>
            )
            : "Personalized Recommendations"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayRecommendations.map((item) => (
            <div
              key={item.productIdStr}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
              onMouseEnter={() => setHoveredItem(item.productIdStr)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative">
                <img
                  src={
                    imageErrors.has(item.productIdStr)
                      ? "/placeholder.svg?height=400&width=300&text=Image+Not+Available"
                      : item.imageUrl
                  }
                  alt={item.name}
                  className="w-full h-full object-cover" // Fixed dimensions
                  onError={() => handleImageError(item.productIdStr)}
                  loading="lazy"
                />

                {/* Rank badge for API results */}
                {item.rank && (
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{item.rank}
                  </div>
                )}

                {/* Hover overlay */}
                {hoveredItem === item.productIdStr && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center space-x-4 transition-opacity duration-300">
                    <button
                      onClick={() => toggleFavorite(item.productIdStr)}
                      className={`p-3 rounded-full transition-colors ${
                        favorites.has(item.productIdStr)
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-700 hover:bg-red-50"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(item.productIdStr) ? "fill-current" : ""}`} />
                    </button>

                    <button className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                      <ShoppingBag className="h-5 w-5" />
                    </button>

                    <button className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Favorite indicator */}
                <button
                  onClick={() => toggleFavorite(item.productIdStr)}
                  className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Heart
                    className={`h-4 w-4 ${favorites.has(item.productIdStr) ? "text-red-500 fill-current" : "text-gray-600"}`}
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold" style={{ color: "#8c5a6e" }}>
                    {item.price}
                  </span>
                  {item.score && <span className="text-xs text-gray-500">Match: {Math.round(item.score * 100)}%</span>}
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{item.category}</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{item.style}</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{item.occasion}</span>
                </div>

                {/* Product ID for reference */}
                <p className="text-xs text-gray-400 mt-2">ID: {item.productIdStr}</p>
              </div>
            </div>
          ))}
        </div>

        {displayRecommendations.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No recommendations found. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Debug info (remove in production)
        {process.env.NODE_ENV === "development" && recommendations.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Debug: API Response Data</h3>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(recommendations.slice(0, 2), null, 2)}</pre>
          </div>
        )} */}
      </div>
    </section>
  )
}
