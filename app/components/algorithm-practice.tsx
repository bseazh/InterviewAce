"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, Trophy, RefreshCw } from "lucide-react"

import { CodeEditor } from "./code-editor"
import { TestCasePanel } from "./test-case-panel"
import type { BackendProblem, ExecuteResponseData } from "@/lib/api"
import { executeCode, fetchProblem } from "@/lib/api"

const DEFAULT_PROBLEM_ID = process.env.NEXT_PUBLIC_DEFAULT_PROBLEM_ID || ""

interface ResultCaseView {
  id: string
  input: string
  expected: string
  actual: string
  passed: boolean
}

export function AlgorithmPractice() {
  const [problemId, setProblemId] = useState(DEFAULT_PROBLEM_ID)
  const [inputProblemId, setInputProblemId] = useState(DEFAULT_PROBLEM_ID)
  const [problem, setProblem] = useState<BackendProblem | null>(null)
  const [loadingProblem, setLoadingProblem] = useState(false)
  const [problemError, setProblemError] = useState<string | null>(null)

  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [results, setResults] = useState<ResultCaseView[]>([])
  const [stdout, setStdout] = useState<string | undefined>(undefined)
  const [stderr, setStderr] = useState<string | undefined>(undefined)
  const [executionTime, setExecutionTime] = useState<string | undefined>(undefined)
  const [runStatus, setRunStatus] = useState<string | undefined>(undefined)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const testCases = useMemo(
    () =>
      problem?.test_cases?.map((testCase, index) => ({
        id: `${index}`,
        input: testCase.input ?? "",
        expectedOutput: testCase.expectedOutput ?? "",
      })) ?? [],
    [problem],
  )

  const loadProblem = async (id: string) => {
    if (!id) {
      setProblem(null)
      setProblemError("请输入题目 ID 或配置 NEXT_PUBLIC_DEFAULT_PROBLEM_ID")
      return
    }

    setLoadingProblem(true)
    setProblemError(null)
    try {
      const data = await fetchProblem(id)
      setProblem(data)
      setCode(data.solution_code || "")
      setLanguage((data.solution_language || "python").toLowerCase())
      setResults([])
      setStdout(undefined)
      setStderr(undefined)
      setExecutionTime(undefined)
      setRunStatus(undefined)
      setProblemId(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setProblemError(message)
      setProblem(null)
    } finally {
      setLoadingProblem(false)
    }
  }

  useEffect(() => {
    void loadProblem(DEFAULT_PROBLEM_ID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const difficultyBadge = useMemo(() => {
    const diff = problem?.difficulty?.toLowerCase()
    if (diff === "easy") return { label: "简单", variant: "secondary" as const }
    if (diff === "hard") return { label: "困难", variant: "destructive" as const }
    if (diff === "medium") return { label: "中等", variant: "default" as const }
    return { label: "未标注", variant: "outline" as const }
  }, [problem?.difficulty])

  const handleExecute = async (mode: "run" | "submit") => {
    if (!problem) return
    setRunError(null)
    const setRunning = mode === "run" ? setIsRunning : setIsSubmitting
    setRunning(true)

    try {
      const response = await executeCode({
        language,
        code,
        problem_id: problem.id,
        match: "tolerant",
        float_tolerance: 1e-6,
      })
      updateExecutionState(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRunError(message)
    } finally {
      setRunning(false)
    }
  }

  const updateExecutionState = (payload: ExecuteResponseData) => {
    setStdout(payload.stdout)
    setStderr(payload.stderr)
    setExecutionTime(payload.executionTime)
    setRunStatus(payload.status)

    if (payload.cases && payload.cases.length > 0) {
      const merged = payload.cases.map((resultCase, index) => {
        const testCase = testCases[index]
        return {
          id: `${index}`,
          input: testCase?.input ?? "",
          expected: resultCase.expected,
          actual: resultCase.actual,
          passed: resultCase.passed,
        }
      })
      setResults(merged)
    } else {
      setResults([])
    }
  }

  const handleLoadProblem = () => {
    void loadProblem(inputProblemId)
  }

  const displayDescription = useMemo(() => {
    if (!problem?.description) return ""
    return problem.description
  }, [problem?.description])

  return (
    <div className="flex h-full">
      <div className="w-full lg:w-1/2 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>题目详情</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="输入题目 UUID"
              value={inputProblemId}
              onChange={(e) => setInputProblemId(e.target.value)}
              className="sm:w-72"
            />
            <Button size="sm" onClick={handleLoadProblem} disabled={loadingProblem} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {loadingProblem ? "加载中..." : "加载题目"}
            </Button>
          </div>
          {problemError && <p className="text-sm text-destructive">{problemError}</p>}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loadingProblem && !problem ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              正在加载题目信息...
            </div>
          ) : problem ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <Badge variant={difficultyBadge.variant}>{difficultyBadge.label}</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>ID: {problemId}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">题目描述</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{displayDescription}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">预设测试用例</h2>
                <div className="space-y-3 text-sm">
                  {testCases.map((testCase, index) => (
                    <Card key={testCase.id} className="border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">用例 {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">输入</span>
                          <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">
                            {testCase.input || "(空)"}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">预期输出</span>
                          <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">
                            {testCase.expectedOutput || "(空)"}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {testCases.length === 0 && <p className="italic text-muted-foreground">暂无测试用例。</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              未加载题目。请在上方输入题目 ID。
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {problem ? (
          <>
            <div className="flex-1">
              <CodeEditor
                language={language}
                code={code}
                defaultCode={problem.solution_code}
                onLanguageChange={setLanguage}
                onCodeChange={setCode}
                onRun={() => void handleExecute("run")}
                onSubmit={() => void handleExecute("submit")}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>
            <div className="flex-[1.2] border-t border-border bg-muted/30">
              <TestCasePanel
                testCases={testCases}
                results={results}
                executionTime={executionTime}
                status={runStatus}
                stdout={stdout}
                stderr={stderr}
                isRunning={isRunning || isSubmitting}
              />
              {runError && <p className="px-4 pb-4 text-sm text-destructive">{runError}</p>}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            选择题目后可开始编程练习。
          </div>
        )}
      </div>
    </div>
  )
}
