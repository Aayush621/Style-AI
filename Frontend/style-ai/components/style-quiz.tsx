"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface StyleQuizProps {
  onClose: () => void
  onComplete: (preferences: Record<string, string | string[]>) => void
}


export default function StyleQuiz({ onClose, onComplete }: StyleQuizProps) {
  const [currentStep, setCurrentStep] = useState(0)
  // const [answers, setAnswers] = useState<Record<string, any>>({})
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})

  const questions = [
    {
      id: "style_preference",
      title: "What's your preferred style?",
      type: "multiple_choice",
      options: [
        { value: "casual", label: "Casual & Comfortable", image: "/placeholder.svg?height=200&width=200" },
        { value: "business", label: "Business Professional", image: "/placeholder.svg?height=200&width=200" },
        { value: "trendy", label: "Trendy & Fashion-Forward", image: "/placeholder.svg?height=200&width=200" },
        { value: "classic", label: "Classic & Timeless", image: "/placeholder.svg?height=200&width=200" },
      ],
    },
    {
      id: "occasions",
      title: "What occasions do you dress for most?",
      type: "multiple_select",
      options: [
        { value: "work", label: "Work/Office" },
        { value: "casual", label: "Casual Outings" },
        { value: "social", label: "Social Events" },
        { value: "formal", label: "Formal Events" },
        { value: "travel", label: "Travel" },
        { value: "fitness", label: "Fitness/Active" },
      ],
    },
    {
      id: "colors",
      title: "Which color palette do you prefer?",
      type: "multiple_choice",
      options: [
        { value: "neutral", label: "Neutral Tones", colors: ["#F5F5DC", "#D2B48C", "#8B7355"] },
        { value: "bold", label: "Bold & Bright", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
        { value: "monochrome", label: "Black & White", colors: ["#000000", "#FFFFFF", "#808080"] },
        { value: "earth", label: "Earth Tones", colors: ["#8B4513", "#228B22", "#B8860B"] },
      ],
    },
    {
      id: "budget",
      title: "What's your typical budget per item?",
      type: "multiple_choice",
      options: [
        { value: "budget", label: "Under $50" },
        { value: "mid", label: "$50 - $150" },
        { value: "premium", label: "$150 - $300" },
        { value: "luxury", label: "$300+" },
      ],
    },
    {
      id: "body_type",
      title: "What's your body type preference for recommendations?",
      type: "multiple_choice",
      options: [
        { value: "petite", label: "Petite" },
        { value: "tall", label: "Tall" },
        { value: "curvy", label: "Curvy" },
        { value: "athletic", label: "Athletic" },
        { value: "plus", label: "Plus Size" },
        { value: "no_preference", label: "No Preference" },
      ],
    },
  ]

  const currentQuestion = questions[currentStep]

  const handleAnswer = (value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isAnswered = answers[currentQuestion.id] !== undefined

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Style Quiz</h2>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "#8c5a6e",
                width: `${((currentStep + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.title}</h3>

          {currentQuestion.type === "multiple_choice" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                    answers[currentQuestion.id] === option.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {'image' in option && (
                      <img
                        src={option.image || "/placeholder.svg"}
                        alt={option.label}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    {'colors' in option && (
                      <div className="flex space-x-2">
                        {option.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "multiple_select" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id]?.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = (answers[currentQuestion.id] as string[]) || []
                      const updated = isSelected
                        ? current.filter((v: string) => v !== option.value)
                        : [...current, option.value]
                      handleAnswer(updated)
                    }}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                      isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            style={{ backgroundColor: "#8c5a6e" }}
          >
            <span>{currentStep === questions.length - 1 ? "Complete Quiz" : "Next"}</span>
            {currentStep < questions.length - 1 && <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
