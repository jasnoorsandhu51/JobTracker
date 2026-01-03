'use client'

import { useState, useEffect } from 'react'
import { easterEggs } from './JobTrackerTable'

export default function QuoteFooter() {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

    // Get daily quote based on day of month (1-30)
    const getDailyQuote = () => {
        const today = new Date()
        const dayOfMonth = today.getDate()
        // Handle months with fewer than 30 days
        const quoteIndex = (dayOfMonth - 1) % easterEggs.length
        return quoteIndex
    }

    // Initialize with daily quote
    useEffect(() => {
        setCurrentQuoteIndex(getDailyQuote())
    }, [])

    const handleQuoteClick = () => {
        setCurrentQuoteIndex((prev) => (prev + 1) % easterEggs.length)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center py-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10">
            <button
                onClick={handleQuoteClick}
                className="text-sm text-gray-500 hover:text-purple-400 transition-colors cursor-pointer max-w-2xl text-center px-4 pointer-events-auto"
            >
                {easterEggs[currentQuoteIndex]}
            </button>
        </div>
    )
}
