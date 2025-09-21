"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trophy, ChevronDown, ChevronUp } from "lucide-react"
import { CodeEditor } from "./code-editor"
import { TestCasePanel } from "./test-case-panel"

// 示例题目数据
const sampleProblem = {
  id: 1,
  title: "二叉树的直径",
  difficulty: "简单",
  timeLimit: "15分钟",
  maxSubmissions: 3,
  description: `给定一棵二叉树，你需要计算它的直径长度。一棵二叉树的直径长度是任意两个结点路径长度中的最大值。这条路径可能穿过也可能不穿过根结点。`,
  note: "两结点之间的路径长度是以它们之间边的数目表示。",
  constraints: ["树中结点数目在范围 [1, 500] 内", "-100 ≤ Node.value ≤ 100"],
  examples: [
    {
      input: "[1,2,3,4,5]",
      output: "3",
      explanation: "长度为 3, 路径为 [4,2,1,3] 或者 [5,2,1,3]",
    },
  ],
}

export function AlgorithmPractice() {
  const [isTestPanelCollapsed, setIsTestPanelCollapsed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [hasRunTests, setHasRunTests] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const testCasePanelRef = useRef<{ runTests: () => void }>(null)

  const handleRunCode = async () => {
    setIsRunning(true)
    setHasRunTests(false)

    // 模拟代码运行
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          name: "用例 1",
          input: "[1,2,3,4,5,6]",
          expectedOutput: "4",
          actualOutput: "-1",
          status: "failed",
          runtime: "0.01ms",
        },
        {
          id: 2,
          name: "用例 2",
          input: "[1,2,3,4,5]",
          expectedOutput: "3",
          actualOutput: "-1",
          status: "failed",
          runtime: "0.01ms",
        },
        {
          id: 3,
          name: "用例 3",
          input: "[1,2]",
          expectedOutput: "1",
          actualOutput: "-1",
          status: "failed",
          runtime: "0.01ms",
        },
        {
          id: 4,
          name: "用例 4",
          input: "[1]",
          expectedOutput: "0",
          actualOutput: "-1",
          status: "failed",
          runtime: "0.01ms",
        },
        {
          id: 5,
          name: "用例 5",
          input: "[1,2,3,4,5,null,null,6,7]",
          expectedOutput: "4",
          actualOutput: "-1",
          status: "failed",
          runtime: "0.01ms",
        },
      ]

      setTestResults(mockResults)
      setHasRunTests(true)
      setIsRunning(false)

      // 触发测试面板更新
      testCasePanelRef.current?.runTests()
    }, 2000)
  }

  const handleSubmitCode = async () => {
    // 先运行测试
    await handleRunCode()

    // 模拟提交过程
    setTimeout(() => {
      // 这里可以添加提交成功/失败的逻辑
      console.log("代码已提交")
    }, 1000)
  }

  return (
    <div className="flex h-full">
      {/* 左侧题目描述 */}
      <div className="w-1/2 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">题目</span>
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">排行榜</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-4">题目: {sampleProblem.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <Badge variant={sampleProblem.difficulty === "简单" ? "secondary" : "destructive"}>
                  {sampleProblem.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>用时 {sampleProblem.timeLimit}</span>
                </div>
                <span className="text-sm text-muted-foreground">最多 {sampleProblem.maxSubmissions} 次提交</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">题目描述</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{sampleProblem.description}</p>

              <div className="bg-muted/50 border-l-4 border-primary p-4 rounded-r-lg mb-4">
                <p className="text-sm">
                  <strong>注意：</strong>
                  {sampleProblem.note}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">约束条件</h2>
              <ul className="space-y-2">
                {sampleProblem.constraints.map((constraint, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">示例</h2>
              {sampleProblem.examples.map((example, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">输入：</span>
                        <code className="ml-2 px-2 py-1 bg-muted rounded text-sm font-mono">{example.input}</code>
                      </div>
                      <div>
                        <span className="font-medium">输出：</span>
                        <code className="ml-2 px-2 py-1 bg-muted rounded text-sm font-mono">{example.output}</code>
                      </div>
                      <div>
                        <span className="font-medium">解释：</span>
                        <span className="ml-2 text-muted-foreground">{example.explanation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧代码编辑器和测试面板 */}
      <div className="flex-1 flex flex-col">
        {/* 代码编辑器 */}
        <div className={`transition-all duration-300 ${isTestPanelCollapsed ? "flex-1" : "flex-[2]"}`}>
          <CodeEditor onRun={handleRunCode} onSubmit={handleSubmitCode} isRunning={isRunning} />
        </div>

        {/* 测试用例面板 */}
        <div
          className={`border-t border-border transition-all duration-300 ${isTestPanelCollapsed ? "h-12" : "flex-1"}`}
        >
          <div className="flex items-center justify-between p-3 bg-muted/30">
            <div className="flex items-center gap-4">
              <Tabs defaultValue="testcases" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="testcases" className="text-xs">
                    测试用例
                  </TabsTrigger>
                  <TabsTrigger value="results" className="text-xs">
                    结果
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTestPanelCollapsed(!isTestPanelCollapsed)}
              className="h-6 w-6 p-0"
            >
              {isTestPanelCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {!isTestPanelCollapsed && (
            <div className="flex-1 overflow-auto">
              <TestCasePanel ref={testCasePanelRef} results={testResults} hasRunTests={hasRunTests} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
