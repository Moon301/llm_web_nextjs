"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"

interface RagChatProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string, modelConfig?: { useOpenAI: boolean; selectedModel: string }) => void
}

export function RagChat({ messages, isLoading, onSendMessage }: RagChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-oss:20b")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

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
    "llama3.3:latest",
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

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf')
      if (pdfFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...pdfFiles])
        console.log('PDF 파일 선택됨:', pdfFiles.map(f => f.name))
      } else {
        alert('PDF 파일만 선택할 수 있습니다.')
      }
    }
  }

  // 파일 제거
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 파일 업로드 (실제 백엔드 연동 시 사용)
  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsUploading(true)
    try {
      // TODO: 실제 파일 업로드 API 호출
      console.log('파일 업로드 시작:', uploadedFiles.map(f => f.name))
      
      // 임시로 2초 대기 (실제 업로드 시에는 제거)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('파일 업로드 완료')
    } catch (error) {
      console.error('파일 업로드 실패:', error)
    } finally {
      setIsUploading(false)
    }
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
    <div className="flex-1 flex min-h-0">
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* RAG 설정 UI - 한 줄 버전 */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex-shrink-0">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">📚 문서</span>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-file-input"
                  />
                  <label htmlFor="pdf-file-input">
                    <Button variant="outline" size="sm" asChild>
                      <span>파일 선택</span>
                    </Button>
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">🔍 검색</span>
                  <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option value="semantic">의미론적</option>
                    <option value="keyword">키워드</option>
                    <option value="hybrid">하이브리드</option>
                  </select>
                </div>

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
                  <span className="text-sm font-medium text-gray-700">🎯 모델</span>
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

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  📊 {uploadedFiles.length}개 | 🔗 {uploadedFiles.length > 0 ? '준비됨' : '대기중'} | 🤖 {selectedModel}
                </div>
                <Button
                  onClick={() => setShowSidebar(!showSidebar)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <span>{showSidebar ? '◀' : '▶'}</span>
                  <span className="text-xs">설정 더보기</span>
                </Button>
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
                    사용자
                  </div>
                ) : (
                  <div className="order-1 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    RAG
                  </div>
                )}

                {/* 메시지 내용 */}
                <div className={cn(
                  message.role === "user" ? "max-w-[70%] order-2" : "w-full order-1",
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
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  RAG
                </div>
                <div className="w-full">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
                placeholder="문서에 대해 질문하세요..."
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

      {/* 우측 사이드바 */}
      {showSidebar && (
        <div className="w-80 border-l border-gray-200 bg-white flex-shrink-0">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📁 문서 관리</h3>
            
            {/* 파일 업로드 상태 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">업로드 상태</span>
                {uploadedFiles.length > 0 && (
                  <Button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    size="sm"
                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUploading ? '업로드 중...' : '업로드'}
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-600">
                📊 문서: {uploadedFiles.length}개<br/>
                🔗 벡터: {uploadedFiles.length > 0 ? '준비됨' : '대기중'}<br/>
                🤖 {useOpenAI ? "OpenAI" : "Ollama"} - {selectedModel}
              </div>
            </div>

            {/* 선택된 파일 목록 */}
            {uploadedFiles.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">선택된 파일</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-600">📄</span>
                          <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          크기: {(file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 ml-2 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm">PDF 파일을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
