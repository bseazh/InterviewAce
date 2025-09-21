"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Save,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Search,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
} from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  wordCount: number
}

interface MarkdownEditorProps {
  knowledgeBaseId: string
  knowledgeBaseName: string
  onBack: () => void
}

export function MarkdownEditor({ knowledgeBaseId, knowledgeBaseName, onBack }: MarkdownEditorProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "面试准备清单",
      content: `# 面试准备清单

## 技术准备

### 算法与数据结构
- [ ] 数组和字符串操作
- [ ] 链表操作
- [ ] 树和图的遍历
- [ ] 动态规划基础
- [ ] 排序和搜索算法

### 系统设计
- [ ] 缓存策略
- [ ] 数据库设计
- [ ] 微服务架构
- [ ] 负载均衡

## 行为面试

### STAR方法
- **Situation**: 描述情况
- **Task**: 说明任务
- **Action**: 解释行动
- **Result**: 总结结果

### 常见问题
1. 介绍一个你最有挑战性的项目
2. 如何处理团队冲突
3. 你的职业规划是什么

## 公司研究

> 了解公司文化、产品和技术栈非常重要

- 公司官网和产品
- 技术博客和开源项目
- 面试官背景调研

## 准备问题

准备一些好问题来问面试官：

\`\`\`
- 团队的技术栈是什么？
- 代码审查流程如何？
- 团队如何处理技术债务？
\`\`\`
`,
      tags: ["面试", "准备", "技术"],
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      wordCount: 245,
    },
    {
      id: "2",
      title: "JavaScript核心概念",
      content: `# JavaScript核心概念

## 闭包 (Closures)

闭包是指函数能够访问其外部作用域的变量，即使在外部函数已经返回之后。

\`\`\`javascript
function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 输出: 8
\`\`\`

## 原型链 (Prototype Chain)

JavaScript中的每个对象都有一个原型，原型链是对象查找属性的机制。

## 异步编程

### Promise
\`\`\`javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("数据获取成功");
    }, 1000);
  });
};
\`\`\`

### Async/Await
\`\`\`javascript
async function getData() {
  try {
    const result = await fetchData();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`
`,
      tags: ["JavaScript", "编程", "概念"],
      createdAt: "2024-01-14",
      updatedAt: "2024-01-14",
      wordCount: 156,
    },
  ])

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", tags: "" })
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const createNote = () => {
    if (newNote.title.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: `# ${newNote.title}\n\n开始编写你的笔记...`,
        tags: newNote.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        wordCount: 0,
      }
      setNotes((prev) => [note, ...prev])
      setSelectedNote(note)
      setEditContent(note.content)
      setEditTitle(note.title)
      setIsEditing(true)
      setNewNote({ title: "", tags: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const saveNote = () => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        title: editTitle,
        content: editContent,
        updatedAt: new Date().toISOString().split("T")[0],
        wordCount: editContent.split(/\s+/).length,
      }
      setNotes((prev) => prev.map((note) => (note.id === selectedNote.id ? updatedNote : note)))
      setSelectedNote(updatedNote)
      setIsEditing(false)
    }
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  const insertMarkdown = (syntax: string, placeholder = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editContent.substring(start, end)
    const replacement = selectedText || placeholder

    let newText = ""
    if (syntax.includes("{}")) {
      newText = syntax.replace("{}", replacement)
    } else {
      newText = `${syntax}${replacement}${syntax}`
    }

    const newContent = editContent.substring(0, start) + newText + editContent.substring(end)
    setEditContent(newContent)

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown renderer for preview
    const html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-primary underline">$1</a>')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-muted-foreground pl-4 italic my-4">$1</blockquote>')
      // Line breaks
      .replace(/\n/g, "<br>")

    return { __html: html }
  }

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "粗体文本"), tooltip: "粗体" },
    { icon: Italic, action: () => insertMarkdown("*", "斜体文本"), tooltip: "斜体" },
    { icon: Link, action: () => insertMarkdown("[链接文本](", "https://example.com)"), tooltip: "链接" },
    { icon: List, action: () => insertMarkdown("- ", "列表项"), tooltip: "无序列表" },
    { icon: ListOrdered, action: () => insertMarkdown("1. ", "列表项"), tooltip: "有序列表" },
    { icon: Quote, action: () => insertMarkdown("> ", "引用文本"), tooltip: "引用" },
    { icon: Code, action: () => insertMarkdown("`", "代码"), tooltip: "行内代码" },
    { icon: ImageIcon, action: () => insertMarkdown("![图片描述](", "图片链接)"), tooltip: "图片" },
  ]

  if (selectedNote) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              ← 返回知识库
            </Button>
            <div>
              <h1 className="text-xl font-bold">{isEditing ? editTitle : selectedNote.title}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedNote.wordCount} 字 • 更新于 {selectedNote.updatedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
                <Button onClick={saveNote}>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditContent(selectedNote.content)
                    setEditTitle(selectedNote.title)
                    setIsEditing(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteNote(selectedNote.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <div className="h-full flex flex-col">
              {/* Title Editor */}
              <div className="p-4 border-b border-border">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="笔记标题"
                  className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
                {toolbarButtons.map((button, index) => (
                  <Button key={index} variant="ghost" size="sm" onClick={button.action} title={button.tooltip}>
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Editor Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "edit" | "preview")}
                className="flex-1 flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="flex-1 p-4 mt-0">
                  <Textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="开始编写你的笔记..."
                    className="w-full h-full resize-none border-none focus-visible:ring-0 font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 p-4 mt-0 overflow-auto">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(editContent)} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(selectedNote.content)}
              />
            </div>
          )}
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
              <h1 className="text-3xl font-bold text-balance">{knowledgeBaseName} - 笔记</h1>
              <p className="text-muted-foreground">共 {notes.length} 篇笔记</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  新建笔记
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新笔记</DialogTitle>
                  <DialogDescription>填写笔记标题和标签</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">标题</label>
                    <Input
                      placeholder="输入笔记标题"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">标签 (用逗号分隔)</label>
                    <Input
                      placeholder="技术, 面试, 学习"
                      value={newNote.tags}
                      onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={createNote}>创建</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-balance">{note.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{note.wordCount} 字</span>
                        <span>更新于 {note.updatedAt}</span>
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
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedNote(note)
                            setEditContent(note.content)
                            setEditTitle(note.title)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
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
                  <div className="text-sm text-muted-foreground mb-4 line-clamp-3 text-pretty">
                    {note.content.replace(/[#*`>\-[\]]/g, "").substring(0, 150)}...
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无笔记</h3>
              <p className="text-muted-foreground mb-4">{searchTerm ? "没有找到匹配的笔记" : "创建你的第一篇笔记"}</p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建笔记
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
