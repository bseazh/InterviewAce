"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Check, X, Edit, Trash2, Brain, Target, Clock, TrendingUp, Shuffle } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed?: string
  nextReview?: string
  correctCount: number
  totalAttempts: number
  tags: string[]
}

interface FlashcardSystemProps {
  knowledgeBaseId: string
  knowledgeBaseName: string
  onBack: () => void
}

export function FlashcardSystem({ knowledgeBaseId, knowledgeBaseName, onBack }: FlashcardSystemProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "1",
      front: "什么是时间复杂度？",
      back: "时间复杂度是算法执行时间与输入规模之间的关系，用大O记号表示算法在最坏情况下的运行时间。",
      difficulty: "medium",
      lastReviewed: "2024-01-15",
      nextReview: "2024-01-17",
      correctCount: 3,
      totalAttempts: 5,
      tags: ["算法", "复杂度"],
    },
    {
      id: "2",
      front: "解释快速排序的基本思想",
      back: "快速排序采用分治策略，选择一个基准元素，将数组分为小于和大于基准的两部分，然后递归地对两部分进行排序。",
      difficulty: "hard",
      lastReviewed: "2024-01-14",
      nextReview: "2024-01-18",
      correctCount: 2,
      totalAttempts: 4,
      tags: ["排序", "分治"],
    },
  ])

  const [currentMode, setCurrentMode] = useState<"manage" | "study">("manage")
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyStats, setStudyStats] = useState({ correct: 0, total: 0 })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCard, setNewCard] = useState({ front: "", back: "", tags: "" })

  const startStudySession = (mode: "all" | "due" | "random") => {
    let cardsToStudy = [...flashcards]

    if (mode === "due") {
      const today = new Date().toISOString().split("T")[0]
      cardsToStudy = flashcards.filter((card) => !card.nextReview || card.nextReview <= today)
    } else if (mode === "random") {
      cardsToStudy = flashcards.sort(() => Math.random() - 0.5).slice(0, 10)
    }

    setStudyCards(cardsToStudy)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setStudyStats({ correct: 0, total: 0 })
    setCurrentMode("study")
  }

  const handleAnswer = (isCorrect: boolean) => {
    const currentCard = studyCards[currentCardIndex]
    const updatedCard = {
      ...currentCard,
      correctCount: isCorrect ? currentCard.correctCount + 1 : currentCard.correctCount,
      totalAttempts: currentCard.totalAttempts + 1,
      lastReviewed: new Date().toISOString().split("T")[0],
      nextReview: getNextReviewDate(isCorrect, currentCard.difficulty),
    }

    setFlashcards((prev) => prev.map((card) => (card.id === currentCard.id ? updatedCard : card)))
    setStudyStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      // Study session complete
      setCurrentMode("manage")
    }
  }

  const getNextReviewDate = (isCorrect: boolean, difficulty: string) => {
    const today = new Date()
    let daysToAdd = 1

    if (isCorrect) {
      switch (difficulty) {
        case "easy":
          daysToAdd = 3
          break
        case "medium":
          daysToAdd = 2
          break
        case "hard":
          daysToAdd = 1
          break
      }
    } else {
      daysToAdd = 1 // Review again tomorrow if incorrect
    }

    today.setDate(today.getDate() + daysToAdd)
    return today.toISOString().split("T")[0]
  }

  const createFlashcard = () => {
    if (newCard.front.trim() && newCard.back.trim()) {
      const card: Flashcard = {
        id: Date.now().toString(),
        front: newCard.front,
        back: newCard.back,
        difficulty: "medium",
        correctCount: 0,
        totalAttempts: 0,
        tags: newCard.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
      setFlashcards((prev) => [...prev, card])
      setNewCard({ front: "", back: "", tags: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const deleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAccuracyRate = (card: Flashcard) => {
    return card.totalAttempts > 0 ? Math.round((card.correctCount / card.totalAttempts) * 100) : 0
  }

  if (currentMode === "study" && studyCards.length > 0) {
    const currentCard = studyCards[currentCardIndex]
    const progress = ((currentCardIndex + (showAnswer ? 0.5 : 0)) / studyCards.length) * 100

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Study Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">学习模式</h1>
                <p className="text-muted-foreground">
                  {currentCardIndex + 1} / {studyCards.length} 张卡片
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  正确率: {studyStats.total > 0 ? Math.round((studyStats.correct / studyStats.total) * 100) : 0}%
                </div>
                <Button variant="outline" onClick={() => setCurrentMode("manage")}>
                  退出学习
                </Button>
              </div>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2" />

            {/* Flashcard */}
            <div className="flex justify-center">
              <Card
                className="w-full max-w-2xl min-h-[400px] cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center">
                  {!showAnswer ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">问题</div>
                      <div className="text-xl font-medium text-balance">{currentCard.front}</div>
                      <div className="text-sm text-muted-foreground mt-8">点击查看答案</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">答案</div>
                      <div className="text-lg text-balance">{currentCard.back}</div>
                      <div className="flex gap-4 mt-8">
                        <Button
                          variant="outline"
                          className="gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAnswer(false)
                          }}
                        >
                          <X className="h-4 w-4" />
                          不会
                        </Button>
                        <Button
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAnswer(true)
                          }}
                        >
                          <Check className="h-4 w-4" />
                          会了
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={onBack} className="mb-2 -ml-4">
                ← 返回知识库
              </Button>
              <h1 className="text-3xl font-bold text-balance">{knowledgeBaseName} - 闪卡</h1>
              <p className="text-muted-foreground">共 {flashcards.length} 张闪卡</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  新建闪卡
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>创建新闪卡</DialogTitle>
                  <DialogDescription>填写问题和答案来创建一张新的闪卡</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">问题</label>
                    <Textarea
                      placeholder="输入问题..."
                      value={newCard.front}
                      onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">答案</label>
                    <Textarea
                      placeholder="输入答案..."
                      value={newCard.back}
                      onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">标签 (用逗号分隔)</label>
                    <Input
                      placeholder="算法, 数据结构, 面试"
                      value={newCard.tags}
                      onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={createFlashcard}>创建</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Study Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startStudySession("all")}>
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">学习全部</h3>
                <p className="text-sm text-muted-foreground">复习所有闪卡</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startStudySession("due")}>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                <h3 className="font-semibold mb-2">复习到期</h3>
                <p className="text-sm text-muted-foreground">复习需要复习的卡片</p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => startStudySession("random")}
            >
              <CardContent className="p-6 text-center">
                <Shuffle className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">随机练习</h3>
                <p className="text-sm text-muted-foreground">随机选择10张卡片</p>
              </CardContent>
            </Card>
          </div>

          {/* Flashcards List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">闪卡列表</h2>
            <div className="grid gap-4">
              {flashcards.map((card) => (
                <Card key={card.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="font-medium text-balance mb-2">{card.front}</div>
                          <div className="text-sm text-muted-foreground text-pretty">{card.back}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(card.difficulty)}`} />
                            <span className="capitalize">{card.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{getAccuracyRate(card)}% 正确率</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{card.totalAttempts} 次练习</span>
                          </div>
                        </div>
                        {card.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {card.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteFlashcard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {flashcards.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无闪卡</h3>
              <p className="text-muted-foreground mb-4">创建你的第一张闪卡开始学习</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建闪卡
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
