"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"
import { Database } from "lucide-react"

interface RagChatProps {
  messages: Message[]
  isLoading: boolean
  onSendRagMessage: (content: string, useOpenAI: boolean, selectedModel: string) => void
  // Hook에서 관리하는 상태들 추가
  uploadedFiles: File[]
  ragKey: string
  addUploadedFile: (file: File) => void
  removeUploadedFile: (index: number) => void
  setRagKey: (key: string) => void
}

export function RagChat({ 
  messages, 
  isLoading, 
  onSendRagMessage,
  uploadedFiles,
  ragKey,
  addUploadedFile,
  removeUploadedFile,
  setRagKey
}: RagChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-oss:20b")
  const [showSidebar, setShowSidebar] = useState(false)
  const [isEmbedding, setIsEmbedding] = useState(false)

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

  // 파일 제거
  const removeFile = (index: number) => {
    removeUploadedFile(index)
  }

  // 파일 업로드 후 더보기 창 활성화
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf')
      if (pdfFiles.length > 0) {
        pdfFiles.forEach(file => addUploadedFile(file))
        console.log('PDF 파일 선택됨:', pdfFiles.map(f => f.name))
        // 파일이 선택되면 더보기 창 활성화
        setShowSidebar(true)
        // 새로운 파일이 추가되면 ragKey 초기화
        setRagKey("")
      } else {
        alert('PDF 파일만 선택할 수 있습니다.')
      }
    }
  }

  // 임베딩 처리 및 Faiss 벡터DB 저장
  const handleEmbedding = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsEmbedding(true)
    
    try {
      console.log('임베딩 시작:', uploadedFiles.map(f => f.name))
      
      // FormData를 사용하여 파일과 함께 전송
      const formData = new FormData()      
      // 업로드된 파일들 추가
      uploadedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // 요청 URL 로깅
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      const requestUrl = `${apiUrl}/chat/embed`
      console.log('요청 URL:', requestUrl)

      // 임베딩 API 엔드포인트로 전송
      const response = await fetch(requestUrl, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      console.log('Response URL:', response.url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response body:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      const data = await response.json()
      console.log('임베딩 완료:', data)
      
      // 임베딩 완료 후 ragKey 저장
      if (data.rag_key) {
        setRagKey(data.rag_key)
        console.log('RAG 키 설정됨:', data.rag_key)
      }
      
      // 성공 메시지 표시
      alert('임베딩이 완료되었습니다!')
      
    } catch (error) {
      console.error('임베딩 실패:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert('임베딩 처리 중 오류가 발생했습니다: ' + errorMessage)
    } finally {
      setIsEmbedding(false)
    }
  }

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      // ragKey가 없으면 임베딩을 먼저 하라고 안내
      if (!ragKey) {
        alert('먼저 문서를 임베딩해주세요!')
        return
      }
      
      // RAG 메시지 전송 (ragKey는 hook에서 자동으로 사용)
      onSendRagMessage(inputValue, useOpenAI, selectedModel)
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
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
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
                  <span className="text-xs">더보기</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="max-w-4xl mx-auto w-full">
            {/* 시작 화면 - 메시지가 없을 때만 표시 */}
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  RAG 채팅
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                  문서 기반 검색 증강 생성 채팅입니다. PDF 문서를 업로드하고 해당 내용에 대한 질문을 할 수 있습니다.
                </p>
                <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 사용 방법</h3>
                  <div className="text-sm text-blue-800 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">1.</span>
                      <span>PDF 파일을 선택하여 업로드하세요</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">2.</span>
                      <span>문서 내용에 대한 질문을 입력하세요</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">3.</span>
                      <span>AI가 문서를 기반으로 정확한 답변을 제공합니다</span>
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
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  RAG
                </div>
                <div className="w-full">
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
            
            {/* RAG 키 상태 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">🔑 RAG 키</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  ragKey ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {ragKey ? "준비됨" : "대기중"}
                </span>
              </div>
              <div className="text-xs text-blue-600 font-mono break-all">
                {ragKey || '임베딩 후 생성됩니다'}
              </div>
            </div>
            
            {/* 파일 업로드 상태 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">업로드 상태</span>
              </div>
              <div className="text-xs text-gray-600">
                📊 문서: {uploadedFiles.length}개<br/>
                🔗 벡터: {ragKey ? '준비됨' : '대기중'}<br/>
                🤖 {useOpenAI ? "OpenAI" : "Ollama"} - {selectedModel}
              </div>
            </div>

            {/* 임베딩 버튼 - 사이드바 크기만큼 늘림 */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <Button
                  onClick={handleEmbedding}
                  disabled={isEmbedding}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  {isEmbedding ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>임베딩 중...</span>
                    </div>
                  ) : (
                    <span>해당 문서로 임베딩하기</span>
                  )}
                </Button>
              </div>
            )}

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
