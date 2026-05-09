'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
}

interface CategoryIconsProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function CategoryIcons({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryIconsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      )
    }
  }

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScrollButtons()
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [categories])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-white shadow-sm relative">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all"
        >
          <ChevronLeft className="h-5 w-5 text-red-600" />
        </motion.button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all"
        >
          <ChevronRight className="h-5 w-5 text-red-600" />
        </motion.button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 py-3 px-3 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl min-w-[65px] sm:min-w-[70px] transition-all flex-shrink-0 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 shadow hover:shadow-md'
            }`}
          >
            <span className="text-xl sm:text-2xl">{category.icon}</span>
            <span className="text-[10px] sm:text-xs font-medium">{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
