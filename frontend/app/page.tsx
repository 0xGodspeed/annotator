"use client"

import { useState, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import TextDisplay from "./components/TextDisplay"
import SummaryDisplay from "./components/SummaryDisplay"
import AnnotationForm from "./components/AnnotationForm"
import NavigationBar from "./components/NavigationBar"

// Mock data for multiple texts and summaries
const textsAndSummaries = Array(10)
  .fill(null)
  .map((_, index) => ({
    id: `text_${index + 1}`,
    text: `This is the original text for item ${index + 1}. It contains detailed information about a specific topic.`,
    summary: `This is a summary of text ${index + 1}. It provides a concise overview of the main points.`,
  }))

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [annotations, setAnnotations] = useState(
    textsAndSummaries.map(() => ({
      comprehensiveness: 0,
      laymanFriendliness: 0,
      factuality: 0,
      usefulness: 0,
    })),
  )

  const handleNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, textsAndSummaries.length - 1))
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const handleAnnotationChange = useCallback(
    (newAnnotation: (typeof annotations)[0]) => {
      setAnnotations((prevAnnotations) => {
        const newAnnotations = [...prevAnnotations]
        newAnnotations[currentIndex] = newAnnotation
        return newAnnotations
      })
    },
    [currentIndex],
  )

  const calculateProgress = (annotation: (typeof annotations)[0]) => {
    return Object.values(annotation).filter(Boolean).length * 25
  }

  const currentItem = textsAndSummaries[currentIndex]
  const currentAnnotation = annotations[currentIndex]

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">Text Annotation Tool</h1>
        <NavigationBar currentIndex={currentIndex} totalItems={textsAndSummaries.length} onNavigate={setCurrentIndex} />
      </header>
      <main className="flex-grow overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 h-full overflow-y-auto p-4 border-r">
          <TextDisplay text={currentItem.text} />
        </div>
        <div className="lg:w-1/2 h-full overflow-y-auto p-4">
          <SummaryDisplay summary={currentItem.summary} />
        </div>
      </main>
      <footer className="bg-gray-100 p-4 sticky bottom-0 z-10">
        <div className="flex justify-between mb-4">
          <Button onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNext} disabled={currentIndex === textsAndSummaries.length - 1}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Progress value={calculateProgress(currentAnnotation)} className="mb-4" />
        <AnnotationForm
          textId={currentItem.id}
          onAnnotationChange={handleAnnotationChange}
          initialAnnotation={currentAnnotation}
        />
      </footer>
    </div>
  )
}

