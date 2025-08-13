export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  chatId: string
  modelInfo?: {
    provider: string
    model: string
  }
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  message: string
  tabType?: string
  modelConfig?: { useOpenAI: boolean; selectedModel: string }
  conversationId?: string
  conversationHistory?: Array<{
    role: string
    content: string
    timestamp: string
  }>
}

export interface ChatResponse {
  response: string
  conversation_id?: string
  model_info?: {
    provider: string
    model: string
  }
}

export interface StreamChunk {
  type: "token" | "done" | "error"
  content: string
  messageId?: string
}
