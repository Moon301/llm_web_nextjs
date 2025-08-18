"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"
import { BarChart3, Bot, User } from "lucide-react"

interface CompareChatProps {
  messages: Message[]
  isLoading: boolean
  onSendCompareMessage: (content: string, modelConfig?: { selectedModels: { model1: string; model2: string; model3: string } }) => void
  comparisonMessages: any[]
}

interface ComparisonMessage {
  id: string
  userMessage: string
  timestamp: Date
  modelResponses: {
    model1: { content: string; model: string; provider: string; isLoading?: boolean }
    model2: { content: string; model: string; provider: string; isLoading?: boolean }
    model3: { content: string; model: string; provider: string; isLoading?: boolean }
  }
}

export function CompareChat({ messages, isLoading, onSendCompareMessage, comparisonMessages }: CompareChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [selectedModels, setSelectedModels] = useState({
    model1: "gemma3:270m",
    model2: "gpt-oss:20b",
    model3: "qwen3:14b"
  })
  
  // comparisonMessages는 props로 받음 (로컬 상태 제거)
  console.log('CompareChat received comparisonMessages:', comparisonMessages)

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendCompareMessage(inputValue, {selectedModels : selectedModels})
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

  // 사용 가능한 모델 목록
  const availableModels = [
    "gemma3:270m",
    "gpt-oss:20b",
    "gpt-oss:120b",
    "gemma3:12b",
    "phi4:14b",
    "qwen3:14b",
    "qwen2.5:14b",
    "llama3.3:latest",
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 모델 비교 설정 UI */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">🤖 모델 1</span>
                <select
                  value={selectedModels.model1}
                  onChange={(e) => setSelectedModels(prev => ({ ...prev, model1: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">🤖 모델 2</span>
                <select
                  value={selectedModels.model2}
                  onChange={(e) => setSelectedModels(prev => ({ ...prev, model2: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">🤖 모델 3</span>
                <select
                  value={selectedModels.model3}
                  onChange={(e) => setSelectedModels(prev => ({ ...prev, model3: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              🔄 병렬 실행 | ⚡ 동시 응답
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* 시작 화면 - 메시지가 없을 때만 표시 */}
          {comparisonMessages.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                모델 비교
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                여러 AI 모델의 응답을 동시에 비교해보세요. 각 모델의 특성과 성능을 한눈에 비교할 수 있습니다.
              </p>
              <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">🔄 비교 방법</h3>
                <div className="text-sm text-blue-800 space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span>비교할 AI 모델을 선택하세요</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">2.</span>
                    <span>동일한 질문을 입력하세요</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">3.</span>
                    <span>3개 모델의 응답을 나란히 비교해보세요</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 비교 메시지들 */}
          {comparisonMessages.map((message) => (
            <div key={message.id} className="space-y-6">
              {/* 사용자 질문 */}
              <div className="flex gap-4 justify-end">
                <div className="max-w-[70%]">
                  <div className="bg-gray-200 rounded-lg p-4 break-words">
                    <div className="text-black">{message.userMessage}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  Me
                </div>
              </div>

              {/* 3개 모델 응답 비교 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 모델 1 응답 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">모델 1</span>
                    <span className="text-xs text-gray-500">({message.modelResponses.model1.model})</span>
                  </div>
                  
                  {message.modelResponses.model1.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <span className="text-sm text-gray-500">응답 생성 중...</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.modelResponses.model1.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* 모델 2 응답 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Bot className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">모델 2</span>
                    <span className="text-xs text-gray-500">({message.modelResponses.model2.model})</span>
                  </div>
                  
                  {message.modelResponses.model2.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <span className="text-sm text-gray-500">응답 생성 중...</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.modelResponses.model2.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* 모델 3 응답 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">모델 3</span>
                    <span className="text-xs text-gray-500">({message.modelResponses.model3.model})</span>
                  </div>
                  
                  {message.modelResponses.model3.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <span className="text-sm text-gray-500">응답 생성 중...</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.modelResponses.model3.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
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
              placeholder="여러 모델로 비교 분석할 질문을 입력하세요..."
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
