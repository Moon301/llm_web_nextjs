"use client"

import { useState, useCallback } from "react"
import type { Message } from "@/types/chat"

export function useBaseChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  
  const clearChat = useCallback(() => {
    setCurrentChatId(null)
  }, [])

  const setChatId = useCallback((chatId: string | null) => {
    setCurrentChatId(chatId)
  }, [])

  return {
    isLoading,
    currentChatId,
    setIsLoading,
    clearChat,
    setChatId,
  }
}
