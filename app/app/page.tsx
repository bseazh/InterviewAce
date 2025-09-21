"use client"

import { useState } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { QuestionBankDashboard } from "@/components/question-bank-dashboard"
import { AlgorithmPractice } from "@/components/algorithm-practice"
import { KnowledgeBase } from "@/components/knowledge-base"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "practice":
        return <AlgorithmPractice />
      case "knowledge":
        return <KnowledgeBase />
      case "questions":
      case "dashboard":
      default:
        return <QuestionBankDashboard />
    }
  }

  return (
    <CollapsibleSidebar currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </CollapsibleSidebar>
  )
}
