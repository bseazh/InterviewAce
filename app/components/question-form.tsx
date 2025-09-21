"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

export interface QuestionFormValues {
  title: string
  description: string
  difficulty: string
  category: string
  tags: string[]
  solution: string
  hints: string
}

interface QuestionFormProps {
  onSubmit: (question: QuestionFormValues) => Promise<void> | void
  onCancel: () => void
  initialData?: Partial<QuestionFormValues>
  isSubmitting?: boolean
  errorMessage?: string | null
}

export function QuestionForm({ onSubmit, onCancel, initialData, isSubmitting = false, errorMessage }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormValues>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    difficulty: initialData?.difficulty ?? "",
    category: initialData?.category ?? "",
    tags: initialData?.tags ?? [],
    solution: initialData?.solution ?? "",
    hints: initialData?.hints ?? "",
  })
  const [newTag, setNewTag] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || new Date().toISOString().split("T")[0],
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const categories = [
    "Array",
    "String",
    "Linked List",
    "Tree",
    "Graph",
    "Dynamic Programming",
    "Sorting",
    "Searching",
    "Hash Table",
    "Stack",
    "Queue",
    "Heap",
    "Math",
    "Other",
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Question" : "Add New Question"}</CardTitle>
        <CardDescription>
          {initialData ? "Update the question details below" : "Create a new question for your interview preparation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Two Sum"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the problem statement..."
              rows={4}
              required
            />
          </div>

          {/* Difficulty and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm" disabled={isSubmitting}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <Label htmlFor="solution">Solution (Optional)</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
              placeholder="Provide the solution or approach..."
              rows={6}
            />
          </div>

          {/* Hints */}
          <div className="space-y-2">
            <Label htmlFor="hints">Hints (Optional)</Label>
            <Textarea
              id="hints"
              value={formData.hints}
              onChange={(e) => setFormData((prev) => ({ ...prev, hints: e.target.value }))}
              placeholder="Add helpful hints..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : initialData ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
