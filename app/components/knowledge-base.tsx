"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, BookOpen, Brain, FileText, Mic, Zap, Folder } from "lucide-react"
import { FlashcardSystem } from "./flashcard-system"
import { MindMapSystem } from "./mindmap-system"
import { MarkdownEditor } from "./markdown-editor"
import { AIPodcastSystem } from "./ai-podcast-system"

interface KnowledgeBase {
  id: string
  name: string
  description: string
  itemCount: number
  lastModified: string
  type: "flashcards" | "notes" | "mindmap" | "podcast"
  color: string
}

export function KnowledgeBase() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: "1",
      name: "算法基础",
      description: "数据结构与算法的核心概念",
      itemCount: 45,
      lastModified: "2024-01-15",
      type: "flashcards",
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "系统设计",
      description: "大规模系统架构设计要点",
      itemCount: 23,
      lastModified: "2024-01-14",
      type: "mindmap",
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "面试经验",
      description: "技术面试的经验总结和技巧",
      itemCount: 12,
      lastModified: "2024-01-13",
      type: "notes",
      color: "bg-purple-500",
    },
    {
      id: "4",
      name: "技术播客",
      description: "AI生成的技术讨论播客",
      itemCount: 8,
      lastModified: "2024-01-16",
      type: "podcast",
      color: "bg-orange-500",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKnowledgeBase, setNewKnowledgeBase] = useState({
    name: "",
    description: "",
    type: "flashcards" as const,
  })
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null)

  const filteredKnowledgeBases = knowledgeBases.filter(
    (kb) =>
      kb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kb.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateKnowledgeBase = () => {
    if (newKnowledgeBase.name.trim()) {
      const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
      const newKB: KnowledgeBase = {
        id: Date.now().toString(),
        name: newKnowledgeBase.name,
        description: newKnowledgeBase.description,
        itemCount: 0,
        lastModified: new Date().toISOString().split("T")[0],
        type: newKnowledgeBase.type,
        color: colors[Math.floor(Math.random() * colors.length)],
      }
      setKnowledgeBases([...knowledgeBases, newKB])
      setNewKnowledgeBase({ name: "", description: "", type: "flashcards" })
      setIsCreateDialogOpen(false)
    }
  }

  const handleDeleteKnowledgeBase = (id: string) => {
    setKnowledgeBases(knowledgeBases.filter((kb) => kb.id !== id))
  }

  const handleKnowledgeBaseClick = (kb: KnowledgeBase) => {
    setSelectedKnowledgeBase(kb)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flashcards":
        return <Zap className="h-4 w-4" />
      case "mindmap":
        return <Brain className="h-4 w-4" />
      case "notes":
        return <FileText className="h-4 w-4" />
      case "podcast":
        return <Mic className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "flashcards":
        return "闪卡"
      case "mindmap":
        return "思维导图"
      case "notes":
        return "笔记"
      case "podcast":
        return "播客"
      default:
        return "未知"
    }
  }

  if (selectedKnowledgeBase) {
    if (selectedKnowledgeBase.type === "flashcards") {
      return (
        <FlashcardSystem
          knowledgeBaseId={selectedKnowledgeBase.id}
          knowledgeBaseName={selectedKnowledgeBase.name}
          onBack={() => setSelectedKnowledgeBase(null)}
        />
      )
    } else if (selectedKnowledgeBase.type === "mindmap") {
      return (
        <MindMapSystem
          knowledgeBaseId={selectedKnowledgeBase.id}
          knowledgeBaseName={selectedKnowledgeBase.name}
          onBack={() => setSelectedKnowledgeBase(null)}
        />
      )
    } else if (selectedKnowledgeBase.type === "notes") {
      return (
        <MarkdownEditor
          knowledgeBaseId={selectedKnowledgeBase.id}
          knowledgeBaseName={selectedKnowledgeBase.name}
          onBack={() => setSelectedKnowledgeBase(null)}
        />
      )
    } else if (selectedKnowledgeBase.type === "podcast") {
      return (
        <AIPodcastSystem
          knowledgeBaseId={selectedKnowledgeBase.id}
          knowledgeBaseName={selectedKnowledgeBase.name}
          onBack={() => setSelectedKnowledgeBase(null)}
        />
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">知识库管理</h1>
              <p className="text-muted-foreground text-pretty">
                创建和管理你的学习资料，支持闪卡、思维导图、笔记和AI播客
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  新建知识库
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新知识库</DialogTitle>
                  <DialogDescription>选择知识库类型并填写基本信息</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">名称</label>
                    <Input
                      placeholder="输入知识库名称"
                      value={newKnowledgeBase.name}
                      onChange={(e) => setNewKnowledgeBase({ ...newKnowledgeBase, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <Input
                      placeholder="输入知识库描述"
                      value={newKnowledgeBase.description}
                      onChange={(e) => setNewKnowledgeBase({ ...newKnowledgeBase, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">类型</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: "flashcards", label: "闪卡", icon: Zap },
                        { value: "mindmap", label: "思维导图", icon: Brain },
                        { value: "notes", label: "笔记", icon: FileText },
                        { value: "podcast", label: "播客", icon: Mic },
                      ].map((type) => (
                        <Button
                          key={type.value}
                          variant={newKnowledgeBase.type === type.value ? "default" : "outline"}
                          className="justify-start gap-2"
                          onClick={() => setNewKnowledgeBase({ ...newKnowledgeBase, type: type.value as any })}
                        >
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateKnowledgeBase}>创建</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索知识库..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Knowledge Base Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKnowledgeBases.map((kb) => (
              <Card
                key={kb.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleKnowledgeBaseClick(kb)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${kb.color} flex items-center justify-center text-white`}>
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{kb.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeIcon(kb.type)}
                          <Badge variant="secondary" className="text-xs">
                            {getTypeName(kb.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteKnowledgeBase(kb.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 text-pretty">{kb.description}</CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{kb.itemCount} 个项目</span>
                    <span>更新于 {kb.lastModified}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredKnowledgeBases.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无知识库</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "没有找到匹配的知识库" : "开始创建你的第一个知识库"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建知识库
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
