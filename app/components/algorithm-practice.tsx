"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Trophy, RefreshCw, Eye, EyeOff, ClipboardCopy, Loader2, PlusCircle } from "lucide-react"

import { CodeEditor } from "./code-editor"
import { TestCasePanel } from "./test-case-panel"
import { ProblemImportDialog } from "./problem-import-dialog"
import {
  executeCode,
  fetchProblem,
  fetchProblemEditorial,
  fetchProblemList,
  fetchProblemSolution,
  type BackendProblem,
  type BackendProblemTestCase,
  type ExecuteResponseData,
  type ProblemListItem,
  type ProblemSolutionPayload,
} from "@/lib/api"

const DEFAULT_PROBLEM_ID = process.env.NEXT_PUBLIC_DEFAULT_PROBLEM_ID || ""

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  cpp: "C++",
  java: "Java",
  go: "Go",
}

const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `# 在此编写 Python 代码
from typing import List

def solution():
    pass

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().strip().split()
    # TODO: 解析输入并输出
`,
  cpp: `// 在此编写 C++ 代码
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // TODO: 读取输入并输出结果
    return 0;
}
`,
  java: `// 在此编写 Java 代码
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        // TODO: 解析输入并输出
    }
}
`,
  go: `// 在此编写 Go 代码
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    _ = line
    // TODO: 解析输入并输出
    fmt.Println(0)
}
`,
}

type ResultCaseView = {
  id: string
  input: string
  expected: string
  actual: string
  passed: boolean
}

export function AlgorithmPractice() {
  const [problemList, setProblemList] = useState<ProblemListItem[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(DEFAULT_PROBLEM_ID || null)
  const [problem, setProblem] = useState<BackendProblem | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingProblem, setLoadingProblem] = useState(false)
  const [problemError, setProblemError] = useState<string | null>(null)

  const [language, setLanguage] = useState<string>("python")
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({})
  const [code, setCode] = useState<string>(LANGUAGE_TEMPLATES.python)

  const [customInput, setCustomInput] = useState("")
  const [results, setResults] = useState<ResultCaseView[]>([])
  const [stdout, setStdout] = useState<string | undefined>(undefined)
  const [stderr, setStderr] = useState<string | undefined>(undefined)
  const [executionTime, setExecutionTime] = useState<string | undefined>(undefined)
  const [runStatus, setRunStatus] = useState<string | undefined>(undefined)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const [solutionVisible, setSolutionVisible] = useState(false)
  const [solutionCache, setSolutionCache] = useState<Record<string, ProblemSolutionPayload>>({})
  const [solutionLoading, setSolutionLoading] = useState(false)

  const [editorialVisible, setEditorialVisible] = useState(false)
  const [editorialContent, setEditorialContent] = useState<string | null>(null)
  const [editorialLoading, setEditorialLoading] = useState(false)
  const [editorialError, setEditorialError] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)

  const supportedLanguages = problem?.solution_languages ?? ["python"]

  const activeTestCases = problem?.test_cases ?? []

  const difficultyBadge = useMemo(() => {
    const diff = problem?.difficulty?.toLowerCase()
    if (diff === "easy") return { label: "简单", variant: "secondary" as const }
    if (diff === "hard") return { label: "困难", variant: "destructive" as const }
    if (diff === "medium") return { label: "中等", variant: "default" as const }
    return { label: "未标注", variant: "outline" as const }
  }, [problem?.difficulty])

  const resetExecutionState = () => {
    setResults([])
    setStdout(undefined)
    setStderr(undefined)
    setExecutionTime(undefined)
    setRunStatus(undefined)
    setRunError(null)
  }

  const loadProblemList = useCallback(async () => {
    try {
      setLoadingList(true)
      const list = await fetchProblemList()
      setProblemList(list)
      if (!selectedProblemId && list.length > 0) {
        setSelectedProblemId(list[0].id)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingList(false)
    }
  }, [selectedProblemId])

  const loadProblem = useCallback(
    async (id: string | null) => {
      if (!id) {
        setProblem(null)
        return
      }
      try {
        setLoadingProblem(true)
        setProblemError(null)
        const data = await fetchProblem(id)
        setProblem(data)
        const defaultLang = data.default_language ?? data.solution_languages[0] ?? "python"
        setLanguage((prev) => {
          const next = data.solution_languages.includes(prev) ? prev : defaultLang
          setCode(codeDrafts[next] ?? LANGUAGE_TEMPLATES[next] ?? "")
          return next
        })
        resetExecutionState()
        setSolutionVisible(false)
        setEditorialVisible(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setProblemError(message)
        setProblem(null)
      } finally {
        setLoadingProblem(false)
      }
    },
    [codeDrafts],
  )

  useEffect(() => {
    void loadProblemList()
  }, [loadProblemList])

  useEffect(() => {
    if (selectedProblemId) {
      void loadProblem(selectedProblemId)
    }
  }, [selectedProblemId, loadProblem])

  const handleLanguageChange = (value: string) => {
    setCodeDrafts((prev) => ({ ...prev, [language]: code }))
    setLanguage(value)
    setCode(codeDrafts[value] ?? LANGUAGE_TEMPLATES[value] ?? "")
    resetExecutionState()
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    setCodeDrafts((prev) => ({ ...prev, [language]: value }))
  }

  const applyExecutionResult = (payload: ExecuteResponseData, cases: BackendProblemTestCase[]) => {
    setStdout(payload.stdout)
    setStderr(payload.stderr)
    setExecutionTime(payload.executionTime)
    setRunStatus(payload.status)

    if (payload.cases && payload.cases.length > 0) {
      const mapped: ResultCaseView[] = payload.cases.map((resultCase, index) => {
        const testCase = cases[index]
        return {
          id: `${index}`,
          input: testCase?.input ?? "",
          expected: resultCase.expected,
          actual: resultCase.actual,
          passed: resultCase.passed,
        }
      })
      setResults(mapped)
    } else {
      setResults([])
    }
  }

  const handleRunCustom = async () => {
    if (!code.trim()) {
      setRunError("请先填写代码")
      return
    }
    try {
      setIsRunning(true)
      setRunError(null)
      const payload: ExecuteResponseData = await executeCode({
        language,
        code,
        stdin: customInput,
      })
      applyExecutionResult(payload, [])
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRunError(message)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!problem) return
    try {
      setIsSubmitting(true)
      setRunError(null)
      const payload: ExecuteResponseData = await executeCode({
        language,
        code,
        problem_id: problem.id,
        match: "tolerant",
        float_tolerance: 1e-6,
      })
      applyExecutionResult(payload, problem.test_cases)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRunError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSolution = async () => {
    if (!problem) return
    if (solutionVisible) {
      setSolutionVisible(false)
      return
    }
    try {
      setSolutionLoading(true)
      if (!solutionCache[language]) {
        const data = await fetchProblemSolution(problem.id, language)
        setSolutionCache((prev) => ({ ...prev, [language]: data }))
      }
      setSolutionVisible(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRunError(message)
    } finally {
      setSolutionLoading(false)
    }
  }

  const toggleEditorial = async () => {
    if (!problem) return
    if (editorialVisible) {
      setEditorialVisible(false)
      return
    }
    try {
      setEditorialLoading(true)
      setEditorialError(null)
      if (!editorialContent) {
        const text = await fetchProblemEditorial(problem.id)
        setEditorialContent(text)
      }
      setEditorialVisible(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setEditorialError(message)
    } finally {
      setEditorialLoading(false)
    }
  }

  const handleImported = (created: BackendProblem) => {
    setProblemList((prev) => [
      {
        id: created.id,
        title: created.title,
        difficulty: created.difficulty,
        tags: created.tags,
        solution_languages: created.solution_languages,
      },
      ...prev,
    ])
    setSelectedProblemId(created.id)
  }

  return (
    <div className="flex h-full w-full">
      <ProblemImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={handleImported} />
      <div className="hidden w-64 shrink-0 border-r border-border bg-background/80 lg:flex lg:flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-base font-semibold">题目列表</h2>
          <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            导入
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-4 text-sm text-muted-foreground">载入中...</div>
          ) : problemList.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">暂无题目，请先导入。</div>
          ) : (
            <ul className="space-y-1 p-2">
              {problemList.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedProblemId(item.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      item.id === selectedProblemId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium line-clamp-1">{item.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.difficulty ?? "未标注"}</span>
                      <div className="flex flex-wrap gap-1">
                        {(item.tags ?? []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex w-full flex-col border-b border-border bg-card/50 backdrop-blur">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>在线刷题系统</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{problem?.title ?? "选择题目"}</h1>
                <Badge variant={difficultyBadge.variant}>{difficultyBadge.label}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedProblemId ?? ""} onValueChange={(value) => setSelectedProblemId(value)}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="选择题目" />
                </SelectTrigger>
                <SelectContent>
                  {problemList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setImportOpen(true)}>
                <PlusCircle className="h-4 w-4" /> 导入题目
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="h-full w-full border-r border-border bg-background/60 lg:w-1/2">
            {loadingProblem ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">正在加载题目信息...</div>
            ) : problem ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>语言：</span>
                  <div className="flex items-center gap-1">
                    {supportedLanguages.map((lang) => (
                      <Badge key={lang} variant={lang === language ? "default" : "outline"} className="text-[10px]">
                        {LANGUAGE_LABEL[lang] ?? lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Tabs defaultValue="description" className="flex-1">
                  <TabsList className="flex w-full gap-2 rounded-none border-b border-border bg-transparent px-4 py-2">
                    <TabsTrigger value="description" className="flex-1">题目描述</TabsTrigger>
                    <TabsTrigger value="editorial" className="flex-1">题解</TabsTrigger>
                    <TabsTrigger value="solution" className="flex-1">参考答案</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="h-full overflow-auto p-4">
                    <div className="space-y-6">
                      <section className="space-y-2">
                        <h2 className="text-lg font-semibold">描述</h2>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {problem.description || "暂无描述"}
                        </p>
                      </section>
                      <section className="space-y-2">
                        <h2 className="text-lg font-semibold">测试用例</h2>
                        <div className="space-y-3">
                          {activeTestCases.map((testCase, index) => (
                            <Card key={index} className="border-border/60">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">用例 {index + 1}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium text-foreground">输入</span>
                                  <pre className="mt-1 whitespace-pre-wrap rounded bg-muted/60 p-3 font-mono">{testCase.input || "(空)"}</pre>
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">预期输出</span>
                                  <pre className="mt-1 whitespace-pre-wrap rounded bg-muted/60 p-3 font-mono">{testCase.expectedOutput || "(空)"}</pre>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {activeTestCases.length === 0 && <p className="text-sm text-muted-foreground">暂无测试用例</p>}
                        </div>
                      </section>
                    </div>
                  </TabsContent>

                  <TabsContent value="editorial" className="h-full overflow-auto p-4">
                    {problem.has_editorial ? (
                      editorialVisible ? (
                        editorialLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> 加载中...
                          </div>
                        ) : editorialError ? (
                          <div className="text-sm text-destructive">{editorialError}</div>
                        ) : (
                          <article className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                            {editorialContent}
                          </article>
                        )
                      ) : (
                        <Button variant="outline" onClick={toggleEditorial}>
                          查看题解
                        </Button>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">暂无题解</p>
                    )}
                  </TabsContent>

                  <TabsContent value="solution" className="flex h-full flex-col p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>参考语言：</span>
                        <Select value={language} onValueChange={handleLanguageChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="选择语言" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedLanguages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {LANGUAGE_LABEL[lang] ?? lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="sm" onClick={toggleSolution} disabled={solutionLoading} className="gap-1">
                        {solutionVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {solutionVisible ? "隐藏答案" : solutionLoading ? "加载中..." : "查看参考"}
                      </Button>
                    </div>
                    {solutionVisible && solutionCache[language] ? (
                      <div className="mt-4 space-y-3">
                        <pre className="whitespace-pre-wrap rounded bg-muted/60 p-4 font-mono text-xs">
                          {solutionCache[language].code}
                        </pre>
                        {solutionCache[language].explanation && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {solutionCache[language].explanation}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigator.clipboard.writeText(solutionCache[language].code)}
                        >
                          <ClipboardCopy className="h-4 w-4" /> 复制代码
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">答案默认隐藏，需要时点击查看。</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : problemError ? (
              <div className="flex h-full items-center justify-center text-sm text-destructive">{problemError}</div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">请选择题目或导入新题。</div>
            )}
          </div>

          <div className="flex h-full w-full flex-col bg-background lg:w-1/2">
            <div className="flex-[2] border-b border-border">
              <CodeEditor
                language={language}
                code={code}
                defaultCode={LANGUAGE_TEMPLATES[language] ?? ""}
                onLanguageChange={handleLanguageChange}
                onCodeChange={handleCodeChange}
                onRun={handleRunCustom}
                onSubmit={handleSubmit}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>
            <div className="flex-[1.2] border-b border-border bg-muted/20">
              <div className="flex items-center gap-3 border-b border-border px-4 py-2">
                <Textarea
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  placeholder="自定义输入（用于运行，不参与判题）"
                  className="min-h-12 flex-1 resize-y"
                />
                <Button variant="outline" size="sm" onClick={handleRunCustom} disabled={isRunning}>
                  {isRunning ? "运行中..." : "运行"}
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !problem}>
                  {isSubmitting ? "判题中..." : "提交"}
                </Button>
              </div>
              <TestCasePanel
                testCases={activeTestCases}
                results={results}
                executionTime={executionTime}
                status={runStatus}
                stdout={stdout}
                stderr={stderr}
                isRunning={isRunning || isSubmitting}
              />
              {runError && <p className="px-4 pb-3 text-sm text-destructive">{runError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

