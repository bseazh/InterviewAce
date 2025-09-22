"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { importProblem, type ProblemImportPayload, type BackendProblem, type BackendProblemTestCase, type ProblemSolutionPayload } from "@/lib/api"

const SUPPORTED_LANGUAGES: { value: string; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
]

interface ProblemImportDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onImported: (problem: BackendProblem) => void
}

interface TestCaseForm extends BackendProblemTestCase {
  id: string
}

interface SolutionForm extends ProblemSolutionPayload {
  enabled: boolean
}

export function ProblemImportDialog({ open, onOpenChange, onImported }: ProblemImportDialogProps) {
  const [title, setTitle] = useState("")
  const [difficulty, setDifficulty] = useState<string | undefined>("medium")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string>("")
  const [editorial, setEditorial] = useState("")
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { id: crypto.randomUUID(), input: "", expectedOutput: "" },
  ])
  const [solutions, setSolutions] = useState<Record<string, SolutionForm>>(
    SUPPORTED_LANGUAGES.reduce((acc, lang) => {
      acc[lang.value] = { language: lang.value, code: "", explanation: "", enabled: lang.value === "python" }
      return acc
    }, {} as Record<string, SolutionForm>),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle("")
    setDifficulty("medium")
    setDescription("")
    setTags("")
    setEditorial("")
    setTestCases([{ id: crypto.randomUUID(), input: "", expectedOutput: "" }])
    setSolutions(
      SUPPORTED_LANGUAGES.reduce((acc, lang) => {
        acc[lang.value] = { language: lang.value, code: "", explanation: "", enabled: lang.value === "python" }
        return acc
      }, {} as Record<string, SolutionForm>),
    )
    setError(null)
  }

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { id: crypto.randomUUID(), input: "", expectedOutput: "" }])
  }

  const removeTestCase = (id: string) => {
    setTestCases((prev) => (prev.length > 1 ? prev.filter((tc) => tc.id !== id) : prev))
  }

  const updateTestCase = (id: string, field: keyof BackendProblemTestCase, value: string) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
  }

  const toggleSolutionLanguage = (lang: string) => {
    setSolutions((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], enabled: !prev[lang].enabled },
    }))
  }

  const updateSolutionCode = (lang: string, field: "code" | "explanation", value: string) => {
    setSolutions((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const enabledSolutions = Object.values(solutions).filter((item) => item.enabled && item.code.trim())
      if (enabledSolutions.length === 0) {
        throw new Error("至少提供一种语言的参考解答")
      }

      const payload: ProblemImportPayload = {
        title,
        description,
        difficulty,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        editorial: editorial.trim() || undefined,
        test_cases: testCases.map(({ input, expectedOutput }) => ({ input, expectedOutput })),
        solutions: enabledSolutions.map(({ language, code, explanation }) => ({
          language,
          code,
          explanation: explanation?.trim() || undefined,
        })),
      }

      const created = await importProblem(payload)
      onImported(created)
      reset()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(value) : (reset(), onOpenChange(value)))}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>导入新题目</DialogTitle>
          <DialogDescription>配置题目描述、测试用例和多语言参考解答。</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="problem-title">题目标题</Label>
              <Input id="problem-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Binary Search" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem-difficulty">难度</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="problem-difficulty">
                  <SelectValue placeholder="选择难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-tags">标签（逗号分隔）</Label>
            <Input id="problem-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="array, binary-search" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-description">题目描述 (Markdown)</Label>
            <Textarea id="problem-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="支持 Markdown，建议包含示例" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">测试用例</Label>
              <Button type="button" size="sm" variant="outline" onClick={addTestCase} className="gap-2">
                <Plus className="h-4 w-4" />
                添加用例
              </Button>
            </div>
            <div className="space-y-3">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="rounded border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>用例 {index + 1}</span>
                    {testCases.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTestCase(testCase.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>输入</Label>
                    <Textarea value={testCase.input} onChange={(event) => updateTestCase(testCase.id, "input", event.target.value)} rows={3} placeholder="按照 stdin 形式填写" />
                  </div>
                  <div className="space-y-2">
                    <Label>预期输出</Label>
                    <Textarea value={testCase.expectedOutput} onChange={(event) => updateTestCase(testCase.id, "expectedOutput", event.target.value)} rows={2} placeholder="判题对比结果" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base">参考解答</Label>
            <p className="text-sm text-muted-foreground">选择需要提供的语言，上传可作为答案展示/对比的代码与思路。</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const solution = solutions[lang.value]
                return (
                  <div key={lang.value} className={`rounded border p-3 space-y-3 ${solution.enabled ? "border-border/70" : "border-dashed border-border/40"}`}>
                    <div className="flex items-center justify-between">
                      <Badge variant={solution.enabled ? "default" : "outline"}>{lang.label}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => toggleSolutionLanguage(lang.value)}>
                        {solution.enabled ? "移除" : "添加"}
                      </Button>
                    </div>
                    {solution.enabled && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>代码</Label>
                          <Textarea value={solution.code} onChange={(event) => updateSolutionCode(lang.value, "code", event.target.value)} rows={4} placeholder={`请输入 ${lang.label} 参考实现`} />
                        </div>
                        <div className="space-y-2">
                          <Label>思路 / 讲解 (可选)</Label>
                          <Textarea value={solution.explanation ?? ""} onChange={(event) => updateSolutionCode(lang.value, "explanation", event.target.value)} rows={3} placeholder="可用于显示在答案面板" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-editorial">题解 / Editorial (可选)</Label>
            <Textarea id="problem-editorial" value={editorial} onChange={(event) => setEditorial(event.target.value)} rows={4} placeholder="长文讲解，可在前端单独展示" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "导入中..." : "提交"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

