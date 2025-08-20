"use client"

import { useState, useCallback } from "react"
import type { Message } from "@/types/chat"
import { useBaseChat } from "./use-base-chat"

export function useRagChat() {
  const { isLoading, currentChatId, setIsLoading, clearChat, setChatId } = useBaseChat()
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [ragKey, setRagKey] = useState<string>("")

  const sendRagMessage = useCallback(
    async (
      content: string, 
      useOpenAI: boolean, 
      selectedModel: string
    ) => {
      if (!content.trim()) return

      // ragKey가 없으면 에러 처리
      if (!ragKey) {
        console.error("RAG Key가 설정되지 않았습니다.")
        return
      }

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
        
        // FormData를 사용하여 파일과 함께 전송
        const formData = new FormData()
        formData.append('message', content)
        formData.append('useOpenAI', useOpenAI.toString())
        formData.append('selectedModel', selectedModel)
        formData.append('conversationId', currentChatId || '')
        formData.append('conversationHistory', JSON.stringify(conversationHistory))
        formData.append('ragKey', ragKey)

        // RAG API 엔드포인트로 전송
        const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        const response = await fetch(`${apiUrl}/chat/rag`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        console.log("RAG API Response:", data)

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
          
          console.log("RAG AI Message with ModelInfo:", aiMessageWithModelInfo)
          
          setMessages((prev) => [...prev, aiMessageWithModelInfo])
          setChatId(data.conversation_id || currentChatId || "")
        }
      } catch (error) {
        console.error("Failed to send RAG message:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [currentChatId, messages, setChatId, ragKey],
  )

  const clearRagChat = useCallback(() => {
    setMessages([])
    clearChat()
  }, [clearChat])

  const addUploadedFile = useCallback((file: File) => {
    setUploadedFiles(prev => [...prev, file])
  }, [])

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([])
  }, [])

  const setRagKeyValue = useCallback((key: string) => {
    setRagKey(key)
  }, [])

  const clearRagKey = useCallback(() => {
    setRagKey("")
  }, [])

  return {
    messages,
    isLoading,
    currentChatId,
    sendRagMessage,
    clearChat: clearRagChat,
    // 파일 관리
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    clearUploadedFiles,
    // RAG 키 관리
    ragKey,
    setRagKey: setRagKeyValue,
    clearRagKey,
  }
}
