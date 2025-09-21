"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Eye, RefreshCw } from "lucide-react"

interface TestCase {
  id: number
  name: string
  input: string
  expectedOutput?: string
  actualOutput?: string
  status?: "pending" | "passed" | "failed"
  runtime?: string
}

interface TestCasePanelProps {
  results?: TestCase[]
  hasRunTests?: boolean
}

const initialTestCases: TestCase[] = [
  { id: 1, name: "用例 1", input: "[1,2,3,4,5,6]", expectedOutput: "4" },
  { id: 2, name: "用例 2", input: "[1,2,3,4,5]", expectedOutput: "3" },
  { id: 3, name: "用例 3", input: "[1,2]", expectedOutput: "1" },
  { id: 4, name: "用例 4", input: "[1]", expectedOutput: "0" },
  { id: 5, name: "用例 5", input: "[1,2,3,4,5,null,null,6,7]", expectedOutput: "4" },
]

export const TestCasePanel = forwardRef<{ runTests: () => void }, TestCasePanelProps>(
  ({ results = [], hasRunTests = false }, ref) => {
    const [activeTab, setActiveTab] = useState("testcases")
    const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases)
    const [selectedCase, setSelectedCase] = useState<number>(1)

    useImperativeHandle(ref, () => ({
      runTests: () => {
        setActiveTab("results")
      },
    }))

    const removeTestCase = (id: number) => {
      setTestCases(testCases.filter((tc) => tc.id !== id))
      if (selectedCase === id && testCases.length > 1) {
        const remainingCases = testCases.filter((tc) => tc.id !== id)
        setSelectedCase(remainingCases[0]?.id || 1)
      }
    }

    const updateTestCaseInput = (id: number, input: string) => {
      setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, input } : tc)))
    }

    const selectedTestCase = testCases.find((tc) => tc.id === selectedCase)

    return (
      <div className="h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="testcases">测试用例</TabsTrigger>
            <TabsTrigger value="results" className="relative">
              结果
              {hasRunTests && (
                <Badge variant="destructive" className="ml-2 h-4 px-1 text-xs">
                  错误
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="testcases" className="flex-1 flex flex-col mt-0">
            {/* 测试用例标签 */}
            <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="flex items-center gap-1">
                  <Button
                    variant={selectedCase === testCase.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCase(testCase.id)}
                    className="h-7 px-2 text-xs whitespace-nowrap"
                  >
                    {testCase.name}
                  </Button>
                  {testCases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(testCase.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs ml-auto">
                <RefreshCw className="h-3 w-3 mr-1" />
                刷新
              </Button>
            </div>

            {/* 测试用例输入 */}
            {selectedTestCase && (
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">输入 #1</label>
                  <Input
                    value={selectedTestCase.input}
                    onChange={(e) => updateTestCaseInput(selectedTestCase.id, e.target.value)}
                    className="font-mono text-sm"
                    placeholder="输入测试数据..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    查看预期输出
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col mt-0">
            {!hasRunTests ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm">运行代码以查看结果</p>
                </div>
              </div>
            ) : (
              <>
                {/* 结果标签 */}
                <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto">
                  {results.map((result) => (
                    <Badge
                      key={result.id}
                      variant={result.status === "passed" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {result.name}
                    </Badge>
                  ))}
                  <div className="ml-auto text-xs text-muted-foreground">运行时间: 0.01ms</div>
                </div>

                {/* 结果详情 */}
                <div className="flex-1 p-4 space-y-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-xs">
                        错误答案
                      </Badge>
                      <span className="text-muted-foreground">差异</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-medium">输入</span>
                        <div className="mt-1 p-2 bg-muted rounded font-mono">{results[0]?.input}</div>
                      </div>

                      <div>
                        <span className="font-medium">输出</span>
                        <div className="mt-1 p-2 bg-muted rounded font-mono">{results[0]?.actualOutput}</div>
                      </div>

                      <div>
                        <span className="font-medium">预期</span>
                        <div className="mt-1 p-2 bg-muted rounded font-mono">{results[0]?.expectedOutput}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  },
)

TestCasePanel.displayName = "TestCasePanel"
