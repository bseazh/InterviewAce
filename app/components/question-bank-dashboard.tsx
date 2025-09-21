"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, BookOpen, Code, Brain, Target, Eye } from "lucide-react"
import { QuestionForm } from "./question-form"
import { QuestionDetailModal } from "./question-detail-modal"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

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

export function QuestionBankDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const isMobile = useMobile()

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      difficulty: "Easy",
      category: "Array",
      tags: ["Hash Table", "Array"],
      solution:
        "function twoSum(nums, target) {\n    const map = new Map();\n    \n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        \n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        \n        map.set(nums[i], i);\n    }\n    \n    return [];\n}",
      hints:
        "1. Think about what you need to find for each number\n2. Consider using a hash table to store numbers you've seen\n3. For each number, check if its complement exists in the hash table",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Binary Tree Inorder Traversal",
      description:
        "Given the root of a binary tree, return the inorder traversal of its nodes' values.\n\nInorder traversal visits nodes in this order: left subtree, root, right subtree.",
      difficulty: "Medium",
      category: "Tree",
      tags: ["Stack", "Tree", "Depth-First Search"],
      solution:
        "function inorderTraversal(root) {\n    const result = [];\n    \n    function inorder(node) {\n        if (!node) return;\n        \n        inorder(node.left);\n        result.push(node.val);\n        inorder(node.right);\n    }\n    \n    inorder(root);\n    return result;\n}",
      hints:
        "1. Remember the order: left, root, right\n2. You can solve this recursively or iteratively\n3. For iterative solution, use a stack",
      createdAt: "2024-01-14",
    },
    {
      id: "3",
      title: "Merge k Sorted Lists",
      description:
        "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
      difficulty: "Hard",
      category: "Linked List",
      tags: ["Linked List", "Divide and Conquer", "Heap"],
      solution:
        "function mergeKLists(lists) {\n    if (!lists || lists.length === 0) return null;\n    \n    while (lists.length > 1) {\n        const mergedLists = [];\n        \n        for (let i = 0; i < lists.length; i += 2) {\n            const l1 = lists[i];\n            const l2 = i + 1 < lists.length ? lists[i + 1] : null;\n            mergedLists.push(mergeTwoLists(l1, l2));\n        }\n        \n        lists = mergedLists;\n    }\n    \n    return lists[0];\n}",
      hints:
        "1. Think about merging two sorted lists first\n2. Consider divide and conquer approach\n3. You can also use a min-heap for efficient solution",
      createdAt: "2024-01-13",
    },
  ])

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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

  const stats = [
    { label: "Total Questions", value: questions.length, icon: BookOpen, color: "text-blue-500" },
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

  const handleAddQuestion = (questionData: any) => {
    const newQuestion = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setQuestions((prev) => [newQuestion, ...prev])
    setShowForm(false)
  }

  const handleEditQuestion = (questionData: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionData.id ? questionData : q)))
    setEditingQuestion(null)
    setShowForm(false)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    setShowDetailModal(false)
    setSelectedQuestion(null)
  }

  const openEditForm = (question: Question) => {
    setEditingQuestion(question)
    setShowForm(true)
  }

  const openDetailModal = (question: Question) => {
    setSelectedQuestion(question)
    setShowDetailModal(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingQuestion(null)
  }

  // Show form when adding or editing
  if (showForm) {
    return (
      <div className={cn("flex-1 p-4 lg:p-6", isMobile && "pt-2")}>
        <QuestionForm
          onSubmit={editingQuestion ? handleEditQuestion : handleAddQuestion}
          onCancel={closeForm}
          initialData={editingQuestion}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className={cn("flex items-center justify-between p-4 lg:p-6", isMobile && "flex-col gap-4 items-start")}>
          <div>
            <h1 className={cn("font-bold text-balance", isMobile ? "text-2xl" : "text-3xl")}>Question Bank</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Manage your interview preparation questions
            </p>
          </div>
          <Button className={cn("gap-2", isMobile && "w-full")} onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-auto")}>
        {/* Stats Cards */}
        <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")}>
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className={cn("p-4 lg:p-6")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-6 w-6 lg:h-8 lg:w-8", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              isMobile ? "Search questions..." : "Search questions by title, description, category, or tags..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className={cn("p-8 lg:p-12 text-center")}>
                <BookOpen className={cn("text-muted-foreground mx-auto mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>No questions found</h3>
                <p className="text-muted-foreground mb-4 text-sm lg:text-base">
                  {searchQuery ? "Try adjusting your search terms" : "Get started by adding your first question"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowForm(true)} className={cn(isMobile && "w-full")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="border-border/50 hover:border-border transition-colors">
                <CardHeader className={cn("pb-3", isMobile && "pb-2")}>
                  <div className={cn("flex items-start justify-between", isMobile && "flex-col gap-3")}>
                    <div className="space-y-2 flex-1">
                      <CardTitle
                        className={cn(
                          "cursor-pointer hover:text-primary transition-colors",
                          isMobile ? "text-base" : "text-lg",
                        )}
                        onClick={() => openDetailModal(question)}
                      >
                        {question.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                        <Badge variant="outline" className="border-border/50">
                          {question.category}
                        </Badge>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-2", isMobile && "w-full justify-end")}>
                      <Button variant="ghost" size="sm" onClick={() => openDetailModal(question)}>
                        <Eye className="h-4 w-4" />
                        {isMobile && <span className="ml-2 lg:hidden">View</span>}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(question)}>
                        <Edit className="h-4 w-4" />
                        {isMobile && <span className="ml-2 lg:hidden">Edit</span>}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isMobile && <span className="ml-2 lg:hidden">Delete</span>}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={cn("pt-0", isMobile && "pt-0")}>
                  <CardDescription className="text-sm leading-relaxed mb-3 line-clamp-2">
                    {question.description}
                  </CardDescription>
                  <div className={cn("flex items-center justify-between", isMobile && "flex-col gap-2 items-start")}>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {question.tags.length > (isMobile ? 2 : 3) && (
                        <Badge variant="secondary" className="text-xs">
                          +{question.tags.length - (isMobile ? 2 : 3)} more
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Created {question.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Question Detail Modal */}
      <QuestionDetailModal
        question={selectedQuestion}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedQuestion(null)
        }}
        onEdit={openEditForm}
        onDelete={handleDeleteQuestion}
      />
    </div>
  )
}
