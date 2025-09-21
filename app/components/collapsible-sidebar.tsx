"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Search,
  Settings,
  Home,
  Database,
  Menu,
  X,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeToggle } from "./theme-toggle"

interface SidebarProps {
  children: React.ReactNode
  currentPage?: string
  onPageChange?: (page: string) => void
}

export function CollapsibleSidebar({ children, currentPage = "dashboard", onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  const menuItems = [
    { icon: Home, label: "仪表盘", href: "/", key: "dashboard" },
    { icon: Database, label: "题库管理", href: "/questions", key: "questions" },
    { icon: Code2, label: "算法练习", href: "/practice", key: "practice" },
    { icon: BookOpen, label: "知识库", href: "/knowledge", key: "knowledge" },
    { icon: Search, label: "搜索", href: "/search", key: "search" },
    { icon: Settings, label: "设置", href: "/settings", key: "settings" },
  ]

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const handleMenuClick = (key: string) => {
    onPageChange?.(key)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-50",
          // Desktop behavior
          !isMobile && (isCollapsed ? "w-16" : "w-64"),
          // Mobile behavior
          isMobile && (isMobileMenuOpen ? "fixed left-0 top-0 h-full w-64 shadow-lg" : "hidden"),
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">面试王牌</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {(!isCollapsed || isMobile) && <ThemeToggle />}
            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0">
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={currentPage === item.key ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3 h-10", !isMobile && isCollapsed && "justify-center px-0")}
              onClick={() => handleMenuClick(item.key)}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Add Question Button */}
        <div className="p-4 border-t border-border">
          <Button
            className={cn("w-full gap-2", !isMobile && isCollapsed && "px-0 justify-center")}
            onClick={() => {
              handleMenuClick("questions")
              if (isMobile) setIsMobileMenuOpen(false)
            }}
          >
            <Plus className="h-4 w-4" />
            {(!isCollapsed || isMobile) && "添加题目"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">面试王牌</span>
            </div>
            <ThemeToggle />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
