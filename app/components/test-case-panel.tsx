"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Terminal } from "lucide-react"

interface TestCase {
  id: string
  input: string
  expectedOutput?: string
}

interface ResultCase {
  id: string
  input: string
  expected: string
  actual: string
  passed: boolean
}

interface TestCasePanelProps {
  testCases: TestCase[]
  results?: ResultCase[]
  executionTime?: string
  status?: string
  stdout?: string
  stderr?: string
  isRunning?: boolean
}

export function TestCasePanel({
  testCases,
  results = [],
  executionTime,
  status,
  stdout,
  stderr,
  isRunning = false,
}: TestCasePanelProps) {
  const hasResults = results.length > 0

  return (
    <Tabs defaultValue="testcases" className="flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
        <TabsTrigger value="testcases">测试用例</TabsTrigger>
        <TabsTrigger value="results" disabled={!hasResults && !isRunning}>
          运行结果
          {hasResults && (
            <Badge variant={results.every((r) => r.passed) ? "secondary" : "destructive"} className="ml-2">
              {results.every((r) => r.passed) ? "通过" : "未通过"}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="testcases" className="flex-1 p-4 space-y-4">
        <div className="h-full overflow-auto pr-2">
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <Card key={testCase.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">用例 {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs uppercase text-muted-foreground">输入</span>
                    <pre className="mt-1 bg-muted/60 p-3 rounded font-mono text-xs whitespace-pre-wrap">
                      {testCase.input || "(空)"}
                    </pre>
                  </div>
                  {testCase.expectedOutput !== undefined && (
                    <div>
                      <span className="text-xs uppercase text-muted-foreground">预期输出</span>
                      <pre className="mt-1 bg-muted/60 p-3 rounded font-mono text-xs whitespace-pre-wrap">
                        {testCase.expectedOutput || "(空)"}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="results" className="flex-1 p-4 space-y-4">
        {isRunning ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            正在执行代码...
          </div>
        ) : !hasResults ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            运行后将显示结果
          </div>
        ) : (
          <>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总体结果</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  {results.every((r) => r.passed) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{status ?? (results.every((r) => r.passed) ? "success" : "error")}</span>
                </div>
                {executionTime && <div>耗时：{executionTime}</div>}
              </CardContent>
            </Card>

            <div className="flex-1 overflow-auto pr-2">
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <Card key={result.id} className="border-border/50">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">用例 {idx + 1}</CardTitle>
                      <Badge variant={result.passed ? "secondary" : "destructive"}>
                        {result.passed ? "通过" : "未通过"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">输入</span>
                        <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">
                          {result.input || "(空)"}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">预期</span>
                        <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">
                          {result.expected}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">实际</span>
                        <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">
                          {result.actual || "(空)"}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {(stdout || stderr) && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    控制台输出
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  {stdout && (
                    <div>
                      <span className="font-medium text-foreground">stdout</span>
                      <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap">{stdout}</pre>
                    </div>
                  )}
                  {stderr && (
                    <div>
                      <span className="font-medium text-foreground">stderr</span>
                      <pre className="mt-1 bg-muted/60 p-3 rounded font-mono whitespace-pre-wrap text-destructive">
                        {stderr}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  )
}
