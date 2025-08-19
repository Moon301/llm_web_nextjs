"use client"

import { useState, useCallback } from "react"
import { useQnaChat } from "./use-qna-chat"
import { useRagChat } from "./use-rag-chat"
import { useCompareChat } from "./use-compare-chat"
import { useQuality } from "./use-quality"

export function useChat() {
  const [activeTab, setActiveTab] = useState<string>("home")
  
  // 각 탭별로 전용 훅 사용
  const qnaChat = useQnaChat()
  const ragChat = useRagChat()
  const compareChat = useCompareChat()
  const qualityChat = useQuality()
  
  // 현재 활성 탭에 따른 메시지와 로딩 상태
  const getCurrentMessages = () => {
    switch (activeTab) {
      case "qna":
        return qnaChat.messages
      case "rag":
        return ragChat.messages
      case "compare":
        return compareChat.messages
      case "quality":
        return qualityChat.messages
      default:
        return []
    }
  }

  const getCurrentIsLoading = () => {
    switch (activeTab) {
      case "qna":
        return qnaChat.isLoading
      case "rag":
        return ragChat.isLoading
      case "compare":
        return compareChat.isLoading
      case "quality":
        return qualityChat.isLoading
      default:
        return false
    }
  }

  const getCurrentChatId = () => {
    switch (activeTab) {
      case "qna":
        return qnaChat.currentChatId
      case "rag":
        return ragChat.currentChatId
      case "compare":
        return compareChat.currentChatId
      case "quality":
        return qualityChat.currentChatId
      default:
        return null
    }
  }

  // 탭 변경 함수
  const setTab = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  // 현재 탭의 채팅 초기화
  const clearCurrentChat = useCallback(() => {
    switch (activeTab) {
      case "qna":
        qnaChat.clearChat()
        break
      case "rag":
        ragChat.clearChat()
        break
      case "compare":
        compareChat.clearChat()
        break
      case "quality":
        qualityChat.clearChat()
        break
    }
  }, [activeTab, qnaChat, ragChat, compareChat, qualityChat])
  
  return {
    // 현재 탭 정보
    activeTab,
    setTab,
    
    // 현재 탭의 상태
    messages: getCurrentMessages(),
    isLoading: getCurrentIsLoading(),
    currentChatId: getCurrentChatId(),
    
    // 탭별 전용 함수들
    qnaChat,
    ragChat,
    compareChat,
    qualityChat,
    
    // 공통 함수
    clearChat: clearCurrentChat,
  }
}
