"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin absolute top-0 left-0"
          style={{ borderColor: "#8c5a6e transparent transparent transparent" }}
        ></div>
      </div>
      <span className="ml-4 text-lg text-gray-600">Finding your perfect style...</span>
    </div>
  )
}
