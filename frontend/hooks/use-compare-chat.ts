import { useState, useCallback } from "react"
import type { Message, ChatRequest } from "@/types/chat"
import {chatApi} from "@/lib/api-client"
import {useBaseChat} from "./use-base-chat"

export function useCompareChat() {
    const {isLoading, currentChatId, setIsLoading, clearChat, setChatId} = useBaseChat()
    const [messages, setMessages] = useState<Message[]>([])
    
    // 3열 UI를 위한 비교 메시지 상태
    const [comparisonMessages, setComparisonMessages] = useState<any[]>([])

    const sendCompareMessage = useCallback(
        async(content: string,
            modelConfig?: {selectedModels: {model1: string, model2: string, model3: string}}
        ) => {
            if(!content.trim()) return

            setIsLoading(true)

            const userMessage: Message = {
                id: `user_${Date.now()}`,
                role: "user",
                content,
                timestamp: new Date(),
                chatId: currentChatId || "",
            }

            setMessages((prev) => [...prev, userMessage])

            // 새로운 비교 메시지 생성 (3열 UI)
            const newComparisonMessage = {
                id: Date.now().toString(),
                userMessage: content,
                timestamp: new Date(),
                modelResponses: {
                    model1: { content: "", model: modelConfig?.selectedModels.model1 || "gemma3:270m", provider: "Local", isLoading: true },
                    model2: { content: "", model: modelConfig?.selectedModels.model2 || "gpt-oss:20b", provider: "Local", isLoading: true },
                    model3: { content: "", model: modelConfig?.selectedModels.model3 || "llama3.3:latest", provider: "Local", isLoading: true }
                }
            }
            
            setComparisonMessages(prev => [...prev, newComparisonMessage])
            console.log('New comparison message created:', newComparisonMessage)
            console.log('Current comparisonMessages:', comparisonMessages)

            try{
                const conversationHistory = messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp.toISOString()
                }))

                // 3개 모델을 동시에 요청하고 응답이 오는 순서대로 스트리밍
                const modelRequests = Object.entries(modelConfig?.selectedModels || {}).map(async ([modelKey, modelName], index) => {
                    const formData = new FormData()
                    formData.append('message', content)
                    formData.append('conversationId', currentChatId || '')
                    formData.append('conversationHistory', JSON.stringify(conversationHistory))
                    formData.append('selectedModel', modelName)

                    const response = await fetch('http://localhost:8002/api/chat/compare', {
                        method: 'POST',
                        body: formData,
                    })

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }

                    const data = await response.json()
                    console.log(`Model ${modelName} Response:`, data)
                    
                    return { modelKey, modelName, data, index }
                })

                // 각 모델의 응답을 받을 때마다 개별적으로 처리 (스트리밍 효과)
                const responses = []
                for (let i = 0; i < modelRequests.length; i++) {
                    try {
                        const { modelKey, modelName, data, index } = await modelRequests[i]
                        responses.push({ modelKey, modelName, data, index })
                        
                        // 응답이 오는 순서대로 즉시 3열 UI 업데이트
                        if (data.response) {
                            console.log(`Updating UI for ${modelKey}:`, data.response)
                            setComparisonMessages(prev => {
                                const updated = prev.map(msg => 
                                    msg.id === newComparisonMessage.id 
                                        ? {
                                            ...msg,
                                            modelResponses: {
                                                ...msg.modelResponses,
                                                [modelKey]: { 
                                                    content: data.response, 
                                                    model: modelName, 
                                                    provider: "Local", 
                                                    isLoading: false 
                                                }
                                            }
                                        }
                                        : msg
                                )
                                console.log(`Updated comparisonMessages for ${modelKey}:`, updated)
                                return updated
                            })
                            
                            // 첫 번째 응답의 conversation_id 사용
                            if (index === 0) {
                                setChatId(data.conversation_id || currentChatId || "")
                            }
                        } else {
                            console.warn(`No response data for ${modelKey}`)
                        }
                    } catch (error) {
                        console.error(`Model ${i} failed:`, error)
                        // 실패한 모델에 대한 에러 처리
                        const failedModelKey = Object.keys(modelConfig?.selectedModels || {})[i]
                        setComparisonMessages(prev => 
                            prev.map(msg => 
                                msg.id === newComparisonMessage.id 
                                    ? {
                                        ...msg,
                                        modelResponses: {
                                            ...msg.modelResponses,
                                            [failedModelKey]: { 
                                                content: `오류가 발생했습니다: ${error}`, 
                                                model: modelConfig?.selectedModels[failedModelKey as keyof typeof modelConfig.selectedModels] || "", 
                                                provider: "Local", 
                                                isLoading: false 
                                            }
                                        }
                                    }
                                    : msg
                            )
                        )
                    }
                }
                
            } catch (error) {
                console.error("Failed to send compare message:", error)
            } finally {
                setIsLoading(false)
            }
        },
        [currentChatId, messages, setChatId],
    )

    const clearCompareChat = useCallback(() => {
        setMessages([])
        setComparisonMessages([])
        clearChat()
    }, [clearChat])

    return {
        messages,
        isLoading,
        currentChatId,
        sendCompareMessage,
        clearChat: clearCompareChat,
        comparisonMessages,
    }
}