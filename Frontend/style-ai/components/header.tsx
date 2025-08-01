"use client"

import { useState } from "react"
import { Menu, X, Heart, User, Sparkles } from "lucide-react"

interface HeaderProps {
  onProfileClick: () => void
  onQuizClick: () => void
}

export default function Header({ onProfileClick, onQuizClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8" style={{ color: "#8c5a6e" }} />
            <span className="text-2xl font-bold text-gray-900">StyleAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#recommendations" className="text-gray-700 hover:text-gray-900 transition-colors">
              Recommendations
            </a>
            <a href="#trends" className="text-gray-700 hover:text-gray-900 transition-colors">
              Trends
            </a>
            <button onClick={onProfileClick} className="text-gray-700 hover:text-gray-900 transition-colors">
              Profile
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-red-500 transition-colors">
              <Heart className="h-6 w-6" />
            </button>
            <button onClick={onProfileClick} className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <User className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#recommendations" className="text-gray-700 hover:text-gray-900 transition-colors">
                Recommendations
              </a>
              <a href="#trends" className="text-gray-700 hover:text-gray-900 transition-colors">
                Trends
              </a>
              <button
                onClick={onProfileClick}
                className="text-left text-gray-700 hover:text-gray-900 transition-colors"
              >
                Profile
              </button>
              <button onClick={onQuizClick} className="text-left text-gray-700 hover:text-gray-900 transition-colors">
                Take Style Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
