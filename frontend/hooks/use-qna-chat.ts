"use client"

import { useState, useCallback } from "react"
import type { Message, ChatRequest } from "@/types/chat"
import { chatApi } from "@/lib/api-client"
import { useBaseChat } from "./use-base-chat"

export function useQnaChat() {
  const { isLoading, currentChatId, setIsLoading, clearChat, setChatId } = useBaseChat()
  const [messages, setMessages] = useState<Message[]>([])

  const sendMessage = useCallback(
    async (content: string, modelConfig?: { useOpenAI: boolean; selectedModel: string }) => {
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

      try {
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }))
        
        const request: ChatRequest = {
          message: content,
          tabType: "qna",
          conversationId: currentChatId || undefined,
          conversationHistory: conversationHistory,
          modelConfig: modelConfig ? {
            useOpenAI: modelConfig.useOpenAI,
            selectedModel: modelConfig.selectedModel
          } : undefined
        }

        const response = await chatApi.sendMessage(request)
        const data = await response.json()
        
        console.log("QNA API Response:", data)

        if (data.response) {
          const aiMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            chatId: data.conversation_id || currentChatId || "",
          }
          
          const aiMessageWithModelInfo = {
            ...aiMessage,
            modelInfo: data.model_info ? {
              provider: data.model_info.provider,
              model: data.model_info.model
            } : undefined
          }
          
          setMessages((prev) => [...prev, aiMessageWithModelInfo])
          setChatId(data.conversation_id || currentChatId || "")
        }
      } catch (error) {
        console.error("Failed to send QNA message:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [currentChatId, messages, setChatId],
  )

  const clearQnaChat = useCallback(() => {
    setMessages([])
    clearChat()
  }, [clearChat])

  return {
    messages,
    isLoading,
    currentChatId,
    sendMessage,
    clearChat: clearQnaChat,
  }
}
