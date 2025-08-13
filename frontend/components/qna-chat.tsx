"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"

interface QnaChatProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string, modelConfig?: { useOpenAI: boolean; selectedModel: string }) => void
}

export function QnaChat({ messages, isLoading, onSendMessage }: QnaChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-oss:20b")

  // OpenAI 모델 목록
  const openaiModels = [
    "gpt-3.5-turbo",
    "gpt-4o",
    "gpt-4o-mini"
  ]

  // Ollama 모델 목록
  const ollamaModels = [
    "gpt-oss:20b",
    "gpt-oss:120b",
    "gemma3:12b",
    "phi4:14b",
    "qwen3:14b",
    "qwen2.5:14b",
    "llama3.3:latest ",
  ]

  // Provider 변경 시 모델도 자동 변경
  const handleProviderChange = (isOpenAI: boolean) => {
    console.log("Provider changed to:", isOpenAI ? "OpenAI" : "Ollama")
    setUseOpenAI(isOpenAI)
    if (isOpenAI) {
      setSelectedModel("gpt-3.5-turbo")
    } else {
      setSelectedModel("gpt-oss:20b")
    }
    console.log("Model changed to:", isOpenAI ? "gpt-3.5-turbo" : "gpt-oss:20b")
  }

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      // 모델 설정 정보를 포함하여 메시지 전송
      onSendMessage(inputValue, { useOpenAI, selectedModel })
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
      {/* 서브 사이드 메뉴 - 탭별 설정 */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">🤖 AI</span>
                <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => handleProviderChange(false)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-md transition-colors font-medium",
                      !useOpenAI
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    Ollama
                  </button>
                  <button
                    onClick={() => handleProviderChange(true)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-md transition-colors font-medium",
                      useOpenAI
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    OpenAI
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">🎯 Model</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                >
                  {(useOpenAI ? openaiModels : ollamaModels).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              현재: {useOpenAI ? "OpenAI" : "Ollama"} - {selectedModel}
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="max-w-4xl mx-auto w-full">
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
              <div className={cn(
                message.role === "user" ? "max-w-[70%] order-2" : "max-w-[85%] order-1",
              )}>
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
                
                {/* 타임스탬프 */}
                <div className={cn(
                  "text-xs text-gray-500 mt-3",
                  message.role === "user" ? "text-right" : "text-left"
                )}>
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
