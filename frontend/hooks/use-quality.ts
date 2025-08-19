"use client"

import { useState, useCallback } from "react"
import type { Message, ChatRequest } from "@/types/chat"
import { useBaseChat } from "./use-base-chat"

export function useQuality() {
  const { isLoading, currentChatId, setIsLoading, clearChat, setChatId } = useBaseChat()
  const [messages, setMessages] = useState<Message[]>([])


  const sendQualityMessage = useCallback(
    async (content: string ) => {
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
        
        const formData = new FormData()
        formData.append('message', content)
        formData.append('conversationId', currentChatId || '')
        formData.append('conversationHistory', JSON.stringify(conversationHistory))


        const response = await fetch('http://127.0.0.1:8002/api/quality/gpt35', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }


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



  const sendHighQualityMessage = useCallback(
    async (orgQuestion: string, orgAnswer: string ) => {

      try {
        
        const formData = new FormData()
        formData.append('orgQuestion', orgQuestion)
        formData.append('orgAnswer', orgAnswer)
   

        const response = await fetch('http://127.0.0.1:8002/api/quality/gpt4o', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }


        const data = await response.json()
        
        console.log("QNA API Response:", data)

        if (data.response) {
          return data.response
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
    sendQualityMessage,
    sendHighQualityMessage,
    clearChat: clearQnaChat,
  }
}
