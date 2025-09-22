"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Play, Upload, RotateCcw, Maximize2, Settings } from "lucide-react"

const languages = [
  { value: "python", label: "Python", icon: "Py" },
  { value: "cpp", label: "C++", icon: "C++" },
]

const defaultTemplates: Record<string, string> = {
  python: `def solution(*args):
    # TODO: implement
    return None

if __name__ == "__main__":
    # read from stdin if needed
    pass
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // TODO: implement
    cout << "Hello" << "\n";
    return 0;
}
`,
}

interface CodeEditorProps {
  language: string
  code: string
  defaultCode?: string
  onLanguageChange?: (language: string) => void
  onCodeChange?: (code: string) => void
  onRun?: () => void
  onSubmit?: () => void
  isRunning?: boolean
  isSubmitting?: boolean
}

export function CodeEditor({
  language,
  code,
  defaultCode,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
}: CodeEditorProps) {
  const handleReset = () => {
    if (onCodeChange) {
      const fallback = defaultCode ?? defaultTemplates[language] ?? ""
      onCodeChange(fallback)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleLanguageSelect = (value: string) => {
    onLanguageChange?.(value)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Copy className="h-3 w-3 mr-1" />
            文件
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">main.{language === "python" ? "py" : "cpp"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {lang.icon}
                    </Badge>
                    <span>{lang.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={isRunning} className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="w-12 bg-muted/20 border-r border-border flex flex-col text-xs text-muted-foreground font-mono">
            {code.split("\n").map((_, index) => (
              <div key={index} className="h-6 flex items-center justify-end px-2">
                {index + 1}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <Textarea
              value={code}
              onChange={(e) => onCodeChange?.(e.target.value)}
              className="absolute inset-0 border-0 resize-none font-mono text-sm leading-6 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                minHeight: "100%",
                lineHeight: "1.5rem",
              }}
              placeholder="在此编写你的代码..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>自动保存</span>
          <span>行 {code.split("\n").length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
            <Copy className="h-3 w-3 mr-1" />
            复制
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning || isSubmitting} className="h-6 px-3 text-xs">
            <Play className="h-3 w-3 mr-1" />
            {isRunning ? "运行中..." : "运行"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || isRunning}
            className="h-6 px-3 text-xs bg-primary hover:bg-primary/90"
          >
            <Upload className="h-3 w-3 mr-1" />
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        </div>
      </div>
    </div>
  )
}
