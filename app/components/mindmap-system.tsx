"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, ZoomIn, ZoomOut, Save, Download } from "lucide-react"

interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  color: string
  parentId?: string
  children: string[]
  level: number
}

interface MindMapSystemProps {
  knowledgeBaseId: string
  knowledgeBaseName: string
  onBack: () => void
}

export function MindMapSystem({ knowledgeBaseId, knowledgeBaseName, onBack }: MindMapSystemProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    {
      id: "root",
      text: "系统设计",
      x: 400,
      y: 300,
      color: "bg-blue-500",
      children: ["1", "2", "3"],
      level: 0,
    },
    {
      id: "1",
      text: "可扩展性",
      x: 200,
      y: 200,
      color: "bg-green-500",
      parentId: "root",
      children: ["1-1", "1-2"],
      level: 1,
    },
    {
      id: "2",
      text: "可靠性",
      x: 200,
      y: 300,
      color: "bg-orange-500",
      parentId: "root",
      children: ["2-1"],
      level: 1,
    },
    {
      id: "3",
      text: "性能",
      x: 200,
      y: 400,
      color: "bg-purple-500",
      parentId: "root",
      children: [],
      level: 1,
    },
    {
      id: "1-1",
      text: "水平扩展",
      x: 50,
      y: 150,
      color: "bg-green-400",
      parentId: "1",
      children: [],
      level: 2,
    },
    {
      id: "1-2",
      text: "垂直扩展",
      x: 50,
      y: 250,
      color: "bg-green-400",
      parentId: "1",
      children: [],
      level: 2,
    },
    {
      id: "2-1",
      text: "容错机制",
      x: 50,
      y: 300,
      color: "bg-orange-400",
      parentId: "2",
      children: [],
      level: 2,
    },
  ])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
  ]

  const addChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId)
    if (!parent) return

    const newId = `${parentId}-${Date.now()}`
    const childCount = parent.children.length
    const angle = childCount * 60 - 30 // Spread children around parent
    const distance = 150
    const newX = parent.x + Math.cos((angle * Math.PI) / 180) * distance
    const newY = parent.y + Math.sin((angle * Math.PI) / 180) * distance

    const newNode: MindMapNode = {
      id: newId,
      text: "新节点",
      x: newX,
      y: newY,
      color: colors[parent.level % colors.length],
      parentId,
      children: [],
      level: parent.level + 1,
    }

    setNodes((prev) => [
      ...prev,
      newNode,
      ...prev.map((node) => (node.id === parentId ? { ...node, children: [...node.children, newId] } : node)),
    ])
    setEditingNode(newId)
    setEditText("新节点")
  }

  const deleteNode = (nodeId: string) => {
    if (nodeId === "root") return // Don't delete root

    const nodeToDelete = nodes.find((n) => n.id === nodeId)
    if (!nodeToDelete) return

    // Remove from parent's children
    const updatedNodes = nodes
      .filter((node) => node.id !== nodeId && !isDescendant(node.id, nodeId))
      .map((node) => ({
        ...node,
        children: node.children.filter((childId) => childId !== nodeId),
      }))

    setNodes(updatedNodes)
    setSelectedNode(null)
  }

  const isDescendant = (nodeId: string, ancestorId: string): boolean => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node || !node.parentId) return false
    if (node.parentId === ancestorId) return true
    return isDescendant(node.parentId, ancestorId)
  }

  const updateNodeText = (nodeId: string, newText: string) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, text: newText } : node)))
    setEditingNode(null)
    setEditText("")
  }

  const handleNodeMouseDown = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedNode(nodeId)
    setIsDragging(true)

    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: event.clientX - rect.left - node.x * zoom - pan.x,
          y: event.clientY - rect.top - node.y * zoom - pan.y,
        })
      }
    }
  }

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !selectedNode || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const newX = (event.clientX - rect.left - pan.x - dragOffset.x) / zoom
      const newY = (event.clientY - rect.top - pan.y - dragOffset.y) / zoom

      setNodes((prev) => prev.map((node) => (node.id === selectedNode ? { ...node, x: newX, y: newY } : node)))
    },
    [isDragging, selectedNode, zoom, pan, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners
  useState(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  })

  const renderConnections = () => {
    return nodes
      .filter((node) => node.parentId)
      .map((node) => {
        const parent = nodes.find((n) => n.id === node.parentId)
        if (!parent) return null

        return (
          <line
            key={`${parent.id}-${node.id}`}
            x1={parent.x}
            y1={parent.y}
            x2={node.x}
            y2={node.y}
            stroke="#e5e7eb"
            strokeWidth="2"
            className="pointer-events-none"
          />
        )
      })
  }

  const renderNodes = () => {
    return nodes.map((node) => (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={node.level === 0 ? 40 : 30}
          className={`${node.color} cursor-pointer transition-all duration-200 ${
            selectedNode === node.id ? "ring-4 ring-primary ring-opacity-50" : ""
          }`}
          onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
          onDoubleClick={() => {
            setEditingNode(node.id)
            setEditText(node.text)
          }}
        />

        {/* Node text */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-sm font-medium pointer-events-none select-none"
          fontSize={node.level === 0 ? "14" : "12"}
        >
          {node.text.length > 8 ? `${node.text.substring(0, 8)}...` : node.text}
        </text>

        {/* Add child button */}
        {selectedNode === node.id && (
          <circle
            cx={node.x + (node.level === 0 ? 50 : 40)}
            cy={node.y}
            r="12"
            className="fill-primary cursor-pointer hover:fill-primary/80"
            onClick={() => addChildNode(node.id)}
          />
        )}
        {selectedNode === node.id && (
          <text
            x={node.x + (node.level === 0 ? 50 : 40)}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-xs pointer-events-none"
          >
            +
          </text>
        )}
      </g>
    ))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              ← 返回知识库
            </Button>
            <div>
              <h1 className="text-xl font-bold">{knowledgeBaseName} - 思维导图</h1>
              <p className="text-sm text-muted-foreground">{nodes.length} 个节点</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* Mind Map Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-move"
            style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedNode(null)
              }
            }}
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connections */}
            {renderConnections()}

            {/* Nodes */}
            {renderNodes()}
          </svg>

          {/* Node editing dialog */}
          {editingNode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">编辑节点</h3>
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="输入节点文本"
                    className="mb-4"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateNodeText(editingNode, editText)
                      } else if (e.key === "Escape") {
                        setEditingNode(null)
                        setEditText("")
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNode(null)
                        setEditText("")
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={() => updateNodeText(editingNode, editText)}>确定</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected node actions */}
          {selectedNode && selectedNode !== "root" && (
            <div className="absolute top-4 right-4 z-40">
              <Card>
                <CardContent className="p-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const node = nodes.find((n) => n.id === selectedNode)
                        if (node) {
                          setEditingNode(selectedNode)
                          setEditText(node.text)
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteNode(selectedNode)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 z-40">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• 单击选择节点</div>
                  <div>• 双击编辑文本</div>
                  <div>• 拖拽移动节点</div>
                  <div>• 点击 + 添加子节点</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
