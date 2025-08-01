"use client"

import { Filter } from "lucide-react"

interface FiltersSectionProps {
  filters: {
    category: string
    style: string
    occasion: string
  }
  // onFiltersChange: (filters: Record<string, string>) => void
  onFiltersChange: (filters: { category: string; style: string; occasion: string }) => void
}

export default function FiltersSection({ filters, onFiltersChange }: FiltersSectionProps) {
  const categories = [
    "All Categories",
    "Dresses",
    "Tops",
    "Bottoms",
    "Outerwear",
    "Shoes",
    "Accessories",
    "Activewear",
    "Formal",
    "Casual",
  ]

  const styles = [
    "All Styles",
    "Casual",
    "Formal",
    "Business",
    "Bohemian",
    "Minimalist",
    "Vintage",
    "Trendy",
    "Classic",
    "Edgy",
  ]

  const occasions = [
    "All Occasions",
    "Work",
    "Weekend",
    "Date Night",
    "Party",
    "Wedding",
    "Travel",
    "Gym",
    "Beach",
    "Formal Event",
  ]

  const handleFilterChange = (filterType: string, value: string) => {
    const newValue = value === `All ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}s` ? "" : value
    onFiltersChange({
      ...filters,
      [filterType]: newValue,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      category: "",
      style: "",
      occasion: "",
    })
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-warm-beige text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-6 w-6" style={{ color: "#8c5a6e" }} />
            <h2 className="text-2xl font-bold text-gray-900">Refine Your Style</h2>
          </div>

          <button
            onClick={clearAllFilters}
            className="text-sm font-medium hover:underline"
            style={{ color: "#8c5a6e" }}
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category || "All Categories"}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-4 py-6 pr-12 bg-white border border-gray-300 rounded-2xl text-gray-900 font-normal appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all duration-200 text-base"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={filters.style || "All Styles"}
              onChange={(e) => handleFilterChange("style", e.target.value)}
              className="w-full px-4 py-6 pr-12 bg-white border border-gray-300 rounded-2xl text-gray-900 font-normal appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all duration-200 text-base"
            >
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
            <select
              value={filters.occasion || "All Occasions"}
              onChange={(e) => handleFilterChange("occasion", e.target.value)}
              className="w-full px-4 py-6 pr-12 bg-white border border-gray-300 rounded-2xl text-gray-900 font-normal appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all duration-200 text-base"
            >
              {occasions.map((occasion) => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
