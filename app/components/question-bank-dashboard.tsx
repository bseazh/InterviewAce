"use client"

import { useState, useEffect, useMemo, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, BookOpen, Code, Brain, Target, Eye } from "lucide-react"
import { QuestionForm, type QuestionFormValues } from "./question-form"
import { QuestionDetailModal } from "./question-detail-modal"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { createQuestionAndGenerate, deleteKnowledgeItem, fetchKnowledgeItems } from "@/lib/api"
import type { BackendKnowledgeItem } from "@/lib/api"

interface Question {
  id: string
  questionId: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  tags: string[]
  solution?: string
  hints?: string
  createdAt: string
  flashcardAnswer: string
  pitfalls: string[]
  projectUsage?: string
  codeLanguage?: string
  codeExplanation?: string
}

const normalizeDifficulty = (value?: string | null): "Easy" | "Medium" | "Hard" => {
  if (!value) return "Medium"
  const lower = value.toLowerCase()
  if (lower === "easy") return "Easy"
  if (lower === "hard") return "Hard"
  return "Medium"
}

const extractTitle = (text: string): string => {
  const firstLine = text.split("\n").map((line) => line.trim()).find((line) => line.length > 0)
  return firstLine || "Untitled Question"
}

const mapBackendToQuestion = (item: BackendKnowledgeItem): Question => {
  const questionText = item.question?.text ?? ""
  const tags = item.question?.tags ?? []
  const difficulty = normalizeDifficulty(item.question?.difficulty)
  const createdAt = item.question?.created_at || item.created_at || new Date().toISOString()

  const codeSnippet = item.code?.snippet ?? ""
  const codeExplanation = item.code?.explanation ?? ""

  const hintParts = [] as string[]
  if (item.flashcard?.pitfalls?.length) {
    hintParts.push(item.flashcard.pitfalls.join("\n"))
  }
  if (item.project_usage) {
    hintParts.push(`Project usage: ${item.project_usage}`)
  }

  return {
    id: item.id,
    questionId: item.question.id,
    title: extractTitle(questionText),
    description: questionText,
    difficulty,
    category: tags[0] || "General",
    tags,
    solution: codeSnippet || undefined,
    hints: hintParts.length ? hintParts.join("\n\n") : undefined,
    createdAt: createdAt.split("T")[0],
    flashcardAnswer: item.flashcard?.answer ?? "",
    pitfalls: item.flashcard?.pitfalls ?? [],
    projectUsage: item.project_usage ?? undefined,
    codeLanguage: item.code?.lang ?? undefined,
    codeExplanation: codeExplanation || undefined,
  }
}

const composeQuestionText = (formData: QuestionFormValues): string => {
  const sections: string[] = []
  sections.push(`Title: ${formData.title}`)
  if (formData.description) {
    sections.push(`Description:\n${formData.description}`)
  }
  if (formData.solution) {
    sections.push(`Solution Outline:\n${formData.solution}`)
  }
  if (formData.hints) {
    sections.push(`Hints:\n${formData.hints}`)
  }
  if (formData.category) {
    sections.push(`Category: ${formData.category}`)
  }
  if (formData.tags?.length) {
    sections.push(`Tags: ${formData.tags.join(", ")}`)
  }
  return sections.join("\n\n")
}

export function QuestionBankDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const isMobile = useMobile()

  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const items = await fetchKnowledgeItems({ page_size: 100 })
      setQuestions(items.map(mapBackendToQuestion))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setLoadError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadQuestions()
  }, [loadQuestions])

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions
    const lc = searchQuery.toLowerCase()
    return questions.filter((question) => {
      const haystack = [
        question.title,
        question.description,
        question.category,
        question.solution,
        question.hints,
        question.flashcardAnswer,
        question.projectUsage,
        question.codeLanguage,
        question.codeExplanation,
        ...question.tags,
        ...question.pitfalls,
      ].filter((value): value is string => Boolean(value))

      return haystack.some((value) => value.toLowerCase().includes(lc))
    })
  }, [questions, searchQuery])

  const stats = useMemo(() => {
    return [
      { label: "Total Items", value: questions.length, icon: BookOpen, color: "text-blue-500" },
      {
        label: "Easy",
        value: questions.filter((q) => q.difficulty === "Easy").length,
        icon: Target,
        color: "text-green-500",
      },
      {
        label: "Medium",
        value: questions.filter((q) => q.difficulty === "Medium").length,
        icon: Code,
        color: "text-yellow-500",
      },
      {
        label: "Hard",
        value: questions.filter((q) => q.difficulty === "Hard").length,
        icon: Brain,
        color: "text-red-500",
      },
    ]
  }, [questions])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Hard":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleAddQuestion = async (questionData: QuestionFormValues) => {
    setFormError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        text: composeQuestionText(questionData),
        tags: Array.from(new Set([...(questionData.tags || []), questionData.category].filter(Boolean))),
        difficulty: questionData.difficulty ? questionData.difficulty.toLowerCase() : undefined,
      }
      const created = await createQuestionAndGenerate(payload)
      setQuestions((prev) => [mapBackendToQuestion(created), ...prev])
      setShowForm(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    setDeleteError(null)
    setDeletingId(id)
    try {
      await deleteKnowledgeItem(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      setShowDetailModal(false)
      setSelectedQuestion(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setDeleteError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const openDetailModal = (question: Question) => {
    setSelectedQuestion(question)
    setDeleteError(null)
    setShowDetailModal(true)
  }

  if (showForm) {
    return (
      <div className={cn("flex-1 p-4 lg:p-6", isMobile && "pt-2")}> 
        <QuestionForm
          onSubmit={handleAddQuestion}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
          errorMessage={formError}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className={cn("flex items-center justify-between p-4 lg:p-6", isMobile && "flex-col gap-4 items-start")}> 
          <div>
            <h1 className={cn("font-bold text-balance", isMobile ? "text-2xl" : "text-3xl")}>Knowledge Items</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Manage AI-generated flashcards, mind maps, and code insights for your interview prep.
            </p>
          </div>
          <Button className={cn("gap-2", isMobile && "w-full")} onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </header>

      <main className={cn("flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-auto")}> 
        {loadError && (
          <div className="border border-destructive/40 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
            {loadError}
          </div>
        )}
        {deleteError && (
          <div className="border border-destructive/40 text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
            {deleteError}
          </div>
        )}

        <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between")}> 
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, tags..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")}> 
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className={cn("p-4 lg:p-6")}> 
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">Loading knowledge items...</div>
        ) : filteredQuestions.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Eye className="h-10 w-10 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No items found</CardTitle>
              <CardDescription>
                Try adjusting your search or add a new question to generate fresh study materials.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2")}> 
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="border-border/60 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{question.title}</CardTitle>
                    <Badge className={cn("ml-2", getDifficultyColor(question.difficulty))}>{question.difficulty}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {question.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created on {question.createdAt}</span>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => openDetailModal(question)}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <QuestionDetailModal
        question={selectedQuestion}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onDelete={handleDeleteQuestion}
        isDeleting={Boolean(deletingId)}
      />
    </div>
  )
}
