"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import TextDisplay from "../components/TextDisplay"
import SummaryDisplay from "../components/SummaryDisplay"
import AnnotationForm from "../components/AnnotationForm"
import NavigationBar from "../components/NavigationBar"

export default function AnnotatePage() {
  const router = useRouter()
  const [textsAndSummaries, setTextsAndSummaries] = useState<Array<{ id: string; text: string; summary: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [annotations, setAnnotations] = useState<
    Array<{
      comprehensiveness: number
      layness: number
      factuality: number
      usefulness: number
    }>
  >([])

  // Add new state for managing highlights and selected error type
  const [highlights, setHighlights] = useState<Array<{ 
    id: string;
    text: string; 
    errorType: string; 
    color: string; 
    summaryId: string;
  }>>([])
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null)

  // Define error types and their colors
  const errorTypes = [
    { name: 'Incorrect Definitions', color: '#FFB6B6' },
    { name: 'Incorrect Synonyms', color: '#BAFFC9' },
    { name: 'Incorrect Background', color: '#BAE1FF' },
    { name: 'Entity errors', color: '#FFE4BA' },
    { name: 'Contradiction', color: '#F8BAFF' },
    { name: 'Omission', color: '#FFFBA1' },
    { name: 'Jumping to Conclusions', color: '#FFD1DC' },
    { name: 'Misinterpretation', color: '#D4A5A5' }
  ]

  // Add handler for error type selection
  const handleErrorTypeSelect = (errorType: string) => {
    setSelectedErrorType(selectedErrorType === errorType ? null : errorType)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, textsAndSummaries.length - 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [textsAndSummaries.length])

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      try {
        /*   const user = await getUser()
          if (!user) {
            router.push("/login")
            return
          }

          const data = await fetchSheetData()

          */
        const data = [
          {
            id: "a",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id aliquam tincidunt, nisl nunc tincidunt nunc, vitae aliquam nunc nunc vitae nunc. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          },
          {
            id: "b",
            text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            summary: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
          },
        ]
        setTextsAndSummaries(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch data. Please try again later.")
        setLoading(false)
      }
    }

    checkUserAndFetchData()
  }, []) // Removed unnecessary router dependency

  useEffect(() => {
    if (textsAndSummaries.length > 0) {
      setAnnotations(
        textsAndSummaries.map(() => ({
          comprehensiveness: 0,
          layness: 0,
          factuality: 0,
          usefulness: 0,
        })),
      )
    }
  }, [textsAndSummaries])

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

  const handleLogout = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Logout failed")
      }

      router.push("/login")
      router.refresh() // Refresh to update auth state
    } catch (error) {
      console.error("Logout failed:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  const currentItem = textsAndSummaries[currentIndex]
  const currentAnnotation = annotations[currentIndex] || {
    comprehensiveness: 0,
    layness: 0,
    factuality: 0,
    usefulness: 0,
  }

  const annotatedCount = annotations.filter((a) => Object.values(a).some((v) => v !== 0)).length

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Text Annotation Tool</h1>
        <div className="flex items-center gap-2">
          {errorTypes.map((errorType) => (
            <Button
              key={errorType.name}
              variant={selectedErrorType === errorType.name ? "secondary" : "outline"}
              className="px-2 py-1 text-xs"
              style={{
                backgroundColor: selectedErrorType === errorType.name ? errorType.color : errorType.color + '80',
                borderColor: errorType.color,
                color: 'black'
              }}
              onClick={() => handleErrorTypeSelect(errorType.name)}
            >
              {errorType.name}
            </Button>
          ))}
          <Button 
            variant="outline"
            onClick={() => setHighlights([])}
            className="px-2 py-1 text-xs"
          >
            Clear All Highlights
          </Button>
          <Button 
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </header>
      <div className="bg-gray-100 p-4 sticky top-16 z-10">
        <NavigationBar currentIndex={currentIndex} totalItems={textsAndSummaries.length} onNavigate={setCurrentIndex} />
      </div>
      <div className="bg-gray-100 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>
              Progress: {annotatedCount} / {textsAndSummaries.length} annotated
            </span>
            <div className="flex items-center gap-2">
              <Progress value={(annotatedCount / textsAndSummaries.length) * 100} className="w-64" />
              <span className="text-sm text-gray-500">
                {Math.round((annotatedCount / textsAndSummaries.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-grow overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 h-full overflow-y-auto p-4 border-r">
          <TextDisplay text={currentItem.text} />
        </div>
        <div className="lg:w-1/2 h-full overflow-y-auto p-4">
          <SummaryDisplay 
            summary={currentItem.summary}
            summaryId={currentItem.id}
            highlights={highlights.filter(h => h.summaryId === currentItem.id)}
            selectedErrorType={selectedErrorType}
            onHighlight={(text, errorType, color, updatedHighlights) => {
              if (updatedHighlights) {
                // If we're updating an existing highlight
                setHighlights(updatedHighlights);
              } else {
                // If it's a new highlight
                setHighlights(prev => [...prev, { 
                  id: Math.random().toString(36).substr(2, 9),
                  text, 
                  errorType, 
                  color,
                  summaryId: currentItem.id 
                }]);
              }
            }}
          />
        </div>
      </main>
      <footer className="bg-gray-100 p-4 sticky bottom-0 z-10">
        <div className="flex justify-between mb-4">
          <Button
            onClick={() => setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={() => setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, textsAndSummaries.length - 1))}
            disabled={currentIndex === textsAndSummaries.length - 1}

          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {/* <Progress value={calculateProgress(currentAnnotation)} className="mb-4" /> */}
        <AnnotationForm
          textId={currentItem.id}
          onAnnotationChange={handleAnnotationChange}
          initialAnnotation={currentAnnotation}
        />
      </footer>
    </div>
  )
}

