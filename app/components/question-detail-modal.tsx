"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, Calendar, Tag } from "lucide-react"

interface Question {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  tags: string[]
  solution?: string
  hints?: string
  createdAt: string
}

interface QuestionDetailModalProps {
  question: Question | null
  isOpen: boolean
  onClose: () => void
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
}

export function QuestionDetailModal({ question, isOpen, onClose, onEdit, onDelete }: QuestionDetailModalProps) {
  if (!question) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">{question.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                <Badge variant="outline" className="border-border/50">
                  {question.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={() => onDelete(question.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags & Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created on {question.createdAt}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Solution</CardTitle>
                <CardDescription>Detailed solution and approach for this problem</CardDescription>
              </CardHeader>
              <CardContent>
                {question.solution ? (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {question.solution}
                  </pre>
                ) : (
                  <p className="text-muted-foreground italic">No solution provided yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hints</CardTitle>
                <CardDescription>Helpful hints to guide you towards the solution</CardDescription>
              </CardHeader>
              <CardContent>
                {question.hints ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.hints}</p>
                ) : (
                  <p className="text-muted-foreground italic">No hints provided yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
