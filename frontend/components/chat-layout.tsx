"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, RotateCcw, Bot, Database, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"
import { HomePage } from "@/components/home-page"
import { QnaChat } from "@/components/qna-chat"
import { RagChat } from "@/components/rag-chat"
import { CompareChat } from "@/components/compare-chat"

type MenuTab = "home" | "qna" | "rag" | "compare" 

export default function ChatLayout() {
  const [activeTab, setActiveTab] = useState<MenuTab>("home")
  const { messages, isLoading, qnaChat, ragChat, clearChat, setTab } = useChat()

  // 탭 변경 시 대화 내용 유지
  const handleTabChange = (tab: MenuTab) => {
    setActiveTab(tab)
    setTab(tab) // useChat 훅의 탭 변경 함수 호출
  }

  const handleClearChat = () => {
    clearChat()
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - 고정 */}
      <div className="w-64 bg-gradient-to-b from-blue-50 to-blue-100 border-r border-blue-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-blue-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">KETI Chat</h1>
              <p className="text-xs text-blue-600">Assistant</p>
            </div>
          </div>
        </div>

        {/* Menu Tabs */}
        <div className="p-4 space-y-2 flex-shrink-0">
          <button
            onClick={() => handleTabChange("home")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              activeTab === "home" ? "bg-blue-200 text-blue-900 shadow-sm" : "text-blue-700 hover:bg-blue-200/50",
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Home</div>
              <div className="text-xs opacity-75">프로젝트 소개</div>
            </div>
          </button>

          <button
            onClick={() => handleTabChange("qna")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              activeTab === "qna" ? "bg-blue-200 text-blue-900 shadow-sm" : "text-blue-700 hover:bg-blue-200/50",
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <div>
              <div className="font-medium">Q&A 채팅</div>
              <div className="text-xs opacity-75">일반 질문답변</div>
            </div>
          </button>

          <button
            onClick={() => handleTabChange("rag")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              activeTab === "rag" ? "bg-blue-200 text-blue-900 shadow-sm" : "text-blue-700 hover:bg-blue-200/50",
            )}
          >
            <Database className="h-5 w-5" />
            <div>
              <div className="font-medium">RAG 채팅</div>
              <div className="text-xs opacity-75">문서 기반 검색</div>
            </div>
          </button>

          <button
            onClick={() => handleTabChange("compare")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              activeTab === "compare" ? "bg-blue-200 text-blue-900 shadow-sm" : "text-blue-700 hover:bg-blue-200/50",
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <div>
              <div className="font-medium">모델 비교</div>
              <div className="text-xs opacity-75">AI 모델 비교</div>
            </div>
          </button>
        </div>

        {/* Clear Chat Button */}
        <div className="p-4 flex-shrink-0">
          <Button
            onClick={handleClearChat}
            variant="outline"
            className="w-full justify-start gap-2 border-blue-300 text-blue-700 hover:bg-blue-200/50 bg-transparent"
            size="sm"
            disabled={messages.length === 0}
          >
            <RotateCcw className="h-4 w-4" />
            대화기록 초기화
          </Button>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header - 고정 */}
        <div className="border-b border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {activeTab === "home" && "KETI Chat"}
                {activeTab === "qna" && "Q&A 채팅"}
                {activeTab === "rag" && "RAG 채팅"}
                {activeTab === "compare" && "모델 비교"}
              </h1>
              <p className="text-sm text-gray-600">
                {activeTab === "home" && "AI 기반 대화형 챗봇 플랫폼입니다."}
                {activeTab === "qna" && "일반적인 질문과 답변을 위한 채팅입니다."}
                {activeTab === "rag" && "문서 기반 검색 증강 생성 채팅입니다."}
                {activeTab === "compare" && "여러 AI 모델의 응답을 비교해보세요."}
              </p>
            </div>
          </div>
        </div>

        {/* 탭별 채팅 컴포넌트 */}
        {activeTab === "home" && (
          <HomePage />
        )}

        {activeTab === "qna" && (
          <QnaChat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={qnaChat.sendMessage}
          />
        )}

        {activeTab === "rag" && (
          <RagChat
            messages={messages}
            isLoading={isLoading}
            onSendRagMessage={ragChat.sendRagMessage}
            uploadedFiles={ragChat.uploadedFiles}
            ragKey={ragChat.ragKey}
            addUploadedFile={ragChat.addUploadedFile}
            removeUploadedFile={ragChat.removeUploadedFile}
            setRagKey={ragChat.setRagKey}
          />
        )}

        {activeTab === "compare" && (
          <CompareChat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={qnaChat.sendMessage}
          />
        )}
      </div>
    </div>
  )
}
