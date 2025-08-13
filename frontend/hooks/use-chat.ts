"use client"

import { useState, useCallback } from "react"
import type { Message, ChatRequest } from "@/types/chat"
import { chatApi } from "@/lib/api-client"

export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  
  // 각 탭별로 대화 내용을 저장하는 객체
  const [tabMessages, setTabMessages] = useState<Record<string, Message[]>>({
    qna: [],
    rag: [],
    compare: []
  })
  
  // 현재 활성 탭 (기본값: qna)
  const [activeTab, setActiveTab] = useState<string>("qna")
  
  // 현재 활성 탭의 메시지들
  const messages = tabMessages[activeTab] || []

  const sendMessage = useCallback(
    async (content: string, tabType: string = "qna", modelConfig?: { useOpenAI: boolean; selectedModel: string }) => {
      if (!content.trim()) return

      setIsLoading(true)

      // Add user message immediately
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
        chatId: currentChatId || "",
      }

      // 현재 탭에 사용자 메시지 추가
      setTabMessages((prev) => ({
        ...prev,
        [tabType]: [...prev[tabType], userMessage]
      }))

      try {
        // 현재 탭의 메시지들을 conversation_history로 변환
        const currentMessages = tabMessages[tabType] || []
        const conversationHistory = currentMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }))
        
        const request: ChatRequest = {
          message: content,
          tabType: tabType,
          conversationId: currentChatId || undefined, // null을 undefined로 변환
          conversationHistory: conversationHistory,
          modelConfig: modelConfig ? {
            useOpenAI: modelConfig.useOpenAI,
            selectedModel: modelConfig.selectedModel
          } : undefined
        }

        const response = await chatApi.sendMessage(request)
        const data = await response.json()
        
        console.log("API Response:", data) // 디버깅용 로그 추가

        if (data.response) {
          const aiMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            chatId: data.conversation_id || currentChatId || "",
          }
          
          // 현재 탭에 AI 메시지 추가
          const aiMessageWithModelInfo = {
            ...aiMessage,
            modelInfo: data.model_info ? {
              provider: data.model_info.provider,
              model: data.model_info.model
            } : undefined
          }
          
          console.log("AI Message with ModelInfo:", aiMessageWithModelInfo) // 디버깅용 로그 추가
          
          setTabMessages((prev) => ({
            ...prev,
            [tabType]: [...prev[tabType], aiMessageWithModelInfo]
          }))
          setCurrentChatId(data.conversation_id || currentChatId || "")
        }
      } catch (error) {
        console.error("Failed to send message:", error)
        // Handle error - maybe show a toast notification
      } finally {
        setIsLoading(false)
      }
    },
    [currentChatId],
  )

  const sendMessageStream = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setIsLoading(true)

      // Add user message immediately
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
        chatId: currentChatId || "",
      }

      setMessages((prev) => [...prev, userMessage])

      // Add placeholder for assistant message
      const assistantMessageId = `assistant_${Date.now()}`
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        chatId: currentChatId || "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        const request: ChatRequest = {
          message: content,
          chatId: currentChatId || undefined,
        }

        const stream = await chatApi.sendMessageStream(request)
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)

          // Update the assistant message with streaming content
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: msg.content + chunk } : msg)),
          )
        }
      } catch (error) {
        console.error("Failed to stream message:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [currentChatId],
  )

  const loadChat = useCallback(async (chatId: string) => {
    try {
      const chatSession = await chatApi.getChatHistory(chatId)
      setMessages(chatSession.messages)
      setCurrentChatId(chatId)
    } catch (error) {
      console.error("Failed to load chat:", error)
    }
  }, [])

  const createNewChat = useCallback(async (title?: string) => {
    try {
      const newChat = await chatApi.createNewChat(title)
      setMessages([])
      setCurrentChatId(newChat.id)
      return newChat
    } catch (error) {
      console.error("Failed to create new chat:", error)
      return null
    }
  }, [])

  const clearChat = useCallback(() => {
    setTabMessages((prev) => ({
      ...prev,
      [activeTab]: []
    }))
    setCurrentChatId(null)
  }, [activeTab])

  // 탭 변경 함수
  const setTab = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])
  
  return {
    messages,
    isLoading,
    currentChatId,
    activeTab,
    setTab,
    sendMessage,
    sendMessageStream,
    loadChat,
    createNewChat,
    clearChat,
  }
}
