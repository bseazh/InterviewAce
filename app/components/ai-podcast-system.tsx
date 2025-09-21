"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
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
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Share,
  Plus,
  Mic,
  Users,
  Clock,
  Sparkles,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"

interface PodcastEpisode {
  id: string
  title: string
  description: string
  duration: number
  createdAt: string
  status: "generating" | "ready" | "error"
  transcript: string
  audioUrl?: string
  hosts: string[]
  topics: string[]
}

interface AIPodcastSystemProps {
  knowledgeBaseId: string
  knowledgeBaseName: string
  onBack: () => void
}

export function AIPodcastSystem({ knowledgeBaseId, knowledgeBaseName, onBack }: AIPodcastSystemProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([
    {
      id: "1",
      title: "深入理解算法复杂度",
      description: "探讨时间复杂度和空间复杂度的核心概念，以及如何在实际开发中应用这些知识。",
      duration: 1245, // seconds
      createdAt: "2024-01-15",
      status: "ready",
      transcript: `主持人A: 欢迎收听今天的技术播客，我是Alice。

主持人B: 我是Bob。今天我们要聊聊算法复杂度这个话题。

主持人A: 对，这是每个程序员都需要掌握的基础概念。Bob，你能先解释一下什么是时间复杂度吗？

主持人B: 当然。时间复杂度描述的是算法执行时间与输入规模之间的关系。我们通常用大O记号来表示，比如O(n)、O(log n)等。

主持人A: 没错。举个例子，如果我们要在一个数组中查找某个元素，线性搜索的时间复杂度就是O(n)，因为最坏情况下需要检查每个元素。

主持人B: 而如果数组是有序的，我们可以使用二分搜索，时间复杂度就降到了O(log n)，效率大大提升。

主持人A: 这就是为什么理解算法复杂度如此重要。它帮助我们选择最适合的算法，特别是在处理大数据集时。

主持人B: 除了时间复杂度，空间复杂度也很重要。它描述算法需要多少额外内存空间。

主持人A: 对，有时候我们需要在时间和空间之间做权衡。比如动态规划中的记忆化搜索，用空间换时间。

主持人B: 总结一下，掌握算法复杂度分析能帮助我们写出更高效的代码，这在面试和实际工作中都非常有用。

主持人A: 好的，今天的分享就到这里。感谢大家收听！`,
      audioUrl: "/placeholder-audio.mp3",
      hosts: ["Alice", "Bob"],
      topics: ["算法", "复杂度", "性能优化"],
    },
    {
      id: "2",
      title: "系统设计中的缓存策略",
      description: "讨论不同的缓存策略及其在大规模系统中的应用场景。",
      duration: 0,
      createdAt: "2024-01-16",
      status: "generating",
      transcript: "",
      hosts: ["Alice", "Bob"],
      topics: ["系统设计", "缓存", "架构"],
    },
  ])

  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    description: "",
    topics: "",
    style: "conversational" as "conversational" | "interview" | "educational",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generatePodcast = async () => {
    if (!newEpisode.title.trim()) return

    setIsGenerating(true)
    const episode: PodcastEpisode = {
      id: Date.now().toString(),
      title: newEpisode.title,
      description: newEpisode.description,
      duration: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "generating",
      transcript: "",
      hosts: ["Alice", "Bob"],
      topics: newEpisode.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
    }

    setEpisodes((prev) => [episode, ...prev])
    setNewEpisode({ title: "", description: "", topics: "", style: "conversational" })
    setIsCreateDialogOpen(false)

    // Simulate AI generation process
    setTimeout(() => {
      const generatedTranscript = `主持人A: 欢迎收听今天关于"${episode.title}"的播客。

主持人B: 今天我们要深入探讨${episode.topics.join("、")}等话题。

主持人A: ${episode.description}

主持人B: 这确实是一个很有趣的话题。让我们从基础概念开始讲起...

[AI生成的播客内容会在这里展开，包含详细的对话和讨论]

主持人A: 总结一下今天的内容，我们讨论了很多实用的知识点。

主持人B: 希望对大家有所帮助。感谢收听！`

      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === episode.id
            ? {
                ...ep,
                status: "ready" as const,
                duration: 1800, // 30 minutes
                transcript: generatedTranscript,
                audioUrl: "/placeholder-audio.mp3",
              }
            : ep,
        ),
      )
      setIsGenerating(false)
    }, 5000)
  }

  const playPause = () => {
    if (!audioRef.current || !selectedEpisode) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipForward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime += 15
  }

  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime -= 15
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !selectedEpisode) return
    const newTime = (value[0] / 100) * selectedEpisode.duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const deleteEpisode = (episodeId: string) => {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId))
    if (selectedEpisode?.id === episodeId) {
      setSelectedEpisode(null)
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [selectedEpisode])

  if (selectedEpisode) {
    const progress = selectedEpisode.duration > 0 ? (currentTime / selectedEpisode.duration) * 100 : 0

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedEpisode(null)}>
              ← 返回播客列表
            </Button>
            <div>
              <h1 className="text-xl font-bold text-balance">{selectedEpisode.title}</h1>
              <p className="text-sm text-muted-foreground">
                {formatTime(selectedEpisode.duration)} • {selectedEpisode.hosts.join(" & ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        {/* Player */}
        <div className="p-6 border-b border-border bg-card">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider value={[progress]} onValueChange={handleSeek} max={100} step={0.1} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(selectedEpisode.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="sm" onClick={skipBackward}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={playPause}
                className="h-12 w-12 rounded-full"
                disabled={selectedEpisode.status !== "ready"}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={skipForward}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 justify-center max-w-xs mx-auto">
              <Volume2 className="h-4 w-4" />
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">播客文稿</h2>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedEpisode.transcript || "文稿生成中..."}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {selectedEpisode.audioUrl && <audio ref={audioRef} src={selectedEpisode.audioUrl} preload="metadata" />}
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
              <h1 className="text-3xl font-bold text-balance">{knowledgeBaseName} - AI播客</h1>
              <p className="text-muted-foreground">AI生成的对话式播客，让学习更有趣</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={isGenerating}>
                  {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  生成播客
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>生成AI播客</DialogTitle>
                  <DialogDescription>基于知识库内容生成对话式播客，让学习更加生动有趣</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">播客标题</label>
                    <Input
                      placeholder="输入播客主题"
                      value={newEpisode.title}
                      onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">播客描述</label>
                    <Textarea
                      placeholder="描述播客内容和要点"
                      value={newEpisode.description}
                      onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">关键话题 (用逗号分隔)</label>
                    <Input
                      placeholder="算法, 数据结构, 面试技巧"
                      value={newEpisode.topics}
                      onChange={(e) => setNewEpisode({ ...newEpisode, topics: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">播客风格</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { value: "conversational", label: "对话式", desc: "轻松的双人对话" },
                        { value: "interview", label: "访谈式", desc: "深度问答形式" },
                        { value: "educational", label: "教学式", desc: "结构化讲解" },
                      ].map((style) => (
                        <Button
                          key={style.value}
                          variant={newEpisode.style === style.value ? "default" : "outline"}
                          className="flex flex-col h-auto p-3 text-left"
                          onClick={() => setNewEpisode({ ...newEpisode, style: style.value as any })}
                        >
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.desc}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={generatePodcast} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          生成播客
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Episodes Grid */}
          <div className="grid gap-6">
            {episodes.map((episode) => (
              <Card
                key={episode.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => episode.status === "ready" && setSelectedEpisode(episode)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white">
                        <Mic className="h-8 w-8" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg text-balance">{episode.title}</CardTitle>
                          {episode.status === "generating" && (
                            <Badge variant="secondary" className="gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              生成中
                            </Badge>
                          )}
                          {episode.status === "ready" && (
                            <Badge variant="default" className="gap-1">
                              <Play className="h-3 w-3" />
                              就绪
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">{episode.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{episode.hosts.join(" & ")}</span>
                          </div>
                          {episode.duration > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(episode.duration)}</span>
                            </div>
                          )}
                          <span>创建于 {episode.createdAt}</span>
                        </div>
                        {episode.topics.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {episode.topics.map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEpisode(episode.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {episode.status === "generating" && (
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI正在生成播客内容...</span>
                        <span>预计需要2-3分钟</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {episodes.length === 0 && (
            <div className="text-center py-12">
              <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无播客</h3>
              <p className="text-muted-foreground mb-4">基于知识库内容生成你的第一个AI播客</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                生成播客
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
