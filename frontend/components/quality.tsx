"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

interface QualityProps {
    messages: Message[]
    isLoading: boolean
    onSendQualityMessage: (content: string) => void
    onSendHighQualityMessage: (orgQuestion: string, orgAnswer: string) => Promise<string>
}

export function Quality({ messages, isLoading, onSendQualityMessage, onSendHighQualityMessage }: QualityProps) {
    const [inputValue, setInputValue] = useState("")
    const [enhancedMessages, setEnhancedMessages] = useState<{[key: string]: string}>({})
    const [expandedMessages, setExpandedMessages] = useState<{[key: string]: boolean}>({})
    const [enhancingMessages, setEnhancingMessages] = useState<{[key: string]: boolean}>({})

    const handleSendMessage = () => {
        if (inputValue.trim() && !isLoading) {
            onSendQualityMessage(inputValue)
            setInputValue("")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSendMessage()
        }
    }

    const handleEnhanceAnswer = async (messageId: string, originalContent: string) => {
        // 해당 AI 답변에 대응하는 사용자 질문 찾기
        const currentMessageIndex = messages.findIndex(msg => msg.id === messageId)
        let userQuestion = ""
        
        if (currentMessageIndex > 0) {
            // AI 답변 이전의 사용자 메시지를 찾음
            for (let i = currentMessageIndex - 1; i >= 0; i--) {
                if (messages[i].role === "user") {
                    userQuestion = messages[i].content
                    break
                }
            }
        }

        // 로딩 상태 시작
        setEnhancingMessages(prev => ({
            ...prev,
            [messageId]: true
        }))

        try {
            // 사용자 질문과 AI 답변을 함께 전송
            const response = await onSendHighQualityMessage(userQuestion, originalContent)
            
            // 답변 향상 요청 (실제로는 API 호출)
            const enhancedContent = `✨**향상된 답변**\n\n${response}`
            
            setEnhancedMessages(prev => ({
                ...prev,
                [messageId]: enhancedContent
            }))
            
            setExpandedMessages(prev => ({
                ...prev,
                [messageId]: true
            }))
        } catch (error) {
            console.error("Failed to enhance answer:", error)
            // 에러 발생 시 기본 향상된 내용 표시
            const enhancedContent = `✨**향상된 답변**\n\n${originalContent}\n\n⚠️ 답변 향상 중 오류가 발생했습니다.`
            
            setEnhancedMessages(prev => ({
                ...prev,
                [messageId]: enhancedContent
            }))
            
            setExpandedMessages(prev => ({
                ...prev,
                [messageId]: true
            }))
        } finally {
            // 로딩 상태 종료
            setEnhancingMessages(prev => ({
                ...prev,
                [messageId]: false
            }))
        }
    }

    const toggleExpanded = (messageId: string) => {
        setExpandedMessages(prev => ({
            ...prev,
            [messageId]: !prev[messageId]
        }))
    }

    // ReactMarkdown 커스텀 컴포넌트
    const markdownComponents = {
        p: ({ children }: any) => <p className="mb-4 last:mb-0">{children}</p>,
        h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
        ul: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
        li: ({ children }: any) => <li className="text-gray-800">{children}</li>,
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">{children}</blockquote>
        ),
        a: ({ href, children }: any) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {children}
            </a>
        ),
        code: ({ children, className }: any) => {
            if (className && className.includes("language-")) {
                return <CodeBlock code={String(children)} language={className.replace("language-", "")} />
            }
            return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="max-w-4xl mx-auto w-full">
                    {/* 시작 화면 - 메시지가 없을 때만 표시 */}
                    {messages.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                답변향상
                            </h2>
                            <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
                                OpenAi 모델의 답변 품질향상 경험해 보기
                            </p>
                            <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 사용 팁</h3>
                                <div className="text-sm text-blue-800 space-y-2 text-left">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>구체적이고 명확한 질문을 해보세요</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>복잡한 주제도 단계별로 나누어 질문하세요</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        <span>AI 모델을 선택하여 다양한 응답을 경험해보세요</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                        >
                            {/* 사용자 아이콘 */}
                            {message.role === "user" ? (
                                <div className="order-3 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                    Me
                                </div>
                            ) : (
                                <div className="order-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                    AI
                                </div>
                            )}

                            {/* 메시지 내용 */}
                            <div className={cn(message.role === "user" ? "max-w-[70%] order-2" : "max-w-[85%] order-1",)}>
                                <div className="bg-gray-50 rounded-lg p-5 text-gray-900 break-words">
                                    {/* AI 모델 정보 표시 */}
                                    {message.role === "assistant" && message.modelInfo && message.modelInfo.provider && message.modelInfo.model && (
                                        <div className="text-xs text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                            🤖 {message.modelInfo.provider}: {message.modelInfo.model}
                                        </div>
                                    )}

                                    {/* 마크다운 렌더링 */}
                                    <div className="text-gray-900 break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                
                                {/* AI 답변 향상하기 버튼 */}
                                {message.role === "assistant" && !enhancedMessages[message.id] && (
                                    <div className="mt-3">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="h-8 px-3 text-xs bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-blue-300 text-blue-700 hover:text-blue-800"
                                            onClick={() => handleEnhanceAnswer(message.id, message.content)}
                                            disabled={enhancingMessages[message.id]}
                                        >
                                            {enhancingMessages[message.id] ? (
                                                <>
                                                    <div className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    향상 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3 h-3 mr-1" /> 답변 향상하기
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* 향상된 답변 영역 */}
                                {message.role === "assistant" && enhancedMessages[message.id] && (
                                    <div className="mt-3">
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => toggleExpanded(message.id)}
                                        >
                                            {expandedMessages[message.id] ? (
                                                <>
                                                    <ChevronUp className="w-3 h-3 mr-1" /> 향상된 답변 접기
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-3 h-3 mr-1" /> 향상된 답변 보기
                                                </>
                                            )}
                                        </Button>
                                        
                                        <div 
                                            className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out",
                                                expandedMessages[message.id] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                            )}
                                        >
                                            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                                <div className="text-gray-900 break-words overflow-y-auto max-h-80">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                        {enhancedMessages[message.id]}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 타임스탬프 */}
                                <div className={cn("text-xs text-gray-500 mt-3", message.role === "user" ? "text-right" : "text-left")}>
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 로딩 상태 */}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                AI
                            </div>
                            <div className="max-w-[85%]">
                                <div className="bg-gray-50 rounded-lg p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="border-t border-gray-200 p-4 flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage()
                        }}
                        className="flex items-center gap-3"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 h-12 px-4"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="h-10 px-4 bg-blue-600 hover:bg-blue-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
