"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Play, Upload, RotateCcw, Maximize2, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const languages = [
  { value: "cpp", label: "C++", icon: "C++" },
  { value: "java", label: "Java", icon: "Java" },
  { value: "python", label: "Python", icon: "Python" },
  { value: "javascript", label: "JavaScript", icon: "JS" },
]

const cppTemplate = `// Definition for a binary tree node
// template<class T>
// class TreeNode {
// public:
//     T data;
//     TreeNode<T>* left;
//     TreeNode<T>* right;
//
//     TreeNode(const T data) : data(data), left(nullptr), right(nullptr) {}
// };

// DiameterOfBinaryTree returns the diameter of tree
int DiameterOfBinaryTree(TreeNode<int>* root)
{
    
    // Replace this placeholder return statement with your code
    return -1;
}`

interface CodeEditorProps {
  onRun?: () => void
  onSubmit?: () => void
  isRunning?: boolean
}

export function CodeEditor({ onRun, onSubmit, isRunning = false }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("cpp")
  const [code, setCode] = useState(cppTemplate)

  const handleReset = () => {
    setCode(cppTemplate)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 编辑器头部 */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Copy className="h-3 w-3 mr-1" />
            文件
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">main.cpp</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-24 h-8">
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 代码编辑区域 */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          {/* 行号 */}
          <div className="w-12 bg-muted/20 border-r border-border flex flex-col text-xs text-muted-foreground font-mono">
            {code.split("\n").map((_, index) => (
              <div key={index} className="h-6 flex items-center justify-end px-2">
                {index + 1}
              </div>
            ))}
          </div>

          {/* 代码区域 */}
          <div className="flex-1 relative">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
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

      {/* 编辑器底部状态栏 */}
      <div className="flex items-center justify-between p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>已保存</span>
          <span>第 17 行，第 1 列</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
            <Copy className="h-3 w-3 mr-1" />
            复制
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            重置
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning} className="h-6 px-3 text-xs">
            <Play className="h-3 w-3 mr-1" />
            {isRunning ? "运行中..." : "运行"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isRunning}
            className="h-6 px-3 text-xs bg-primary hover:bg-primary/90"
          >
            <Upload className="h-3 w-3 mr-1" />
            提交
          </Button>
        </div>
      </div>
    </div>
  )
}
