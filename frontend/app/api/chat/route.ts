import { type NextRequest, NextResponse } from "next/server"
import type { ChatRequest, Message } from "@/types/chat"

// This will be replaced with actual FastAPI integration
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, chatId, sessionId } = body

    // TODO: Replace with actual FastAPI call to LangGraph
    const response = await callFastAPI({
      message,
      chatId,
      sessionId,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Mock function - replace with actual FastAPI integration
async function callFastAPI(request: ChatRequest) {
  // This is where you'll integrate with your FastAPI backend
  // Example:
  // const response = await fetch('http://your-fastapi-server/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // })

  // Mock response for now
  const mockMessage: Message = {
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: `안녕하세요! "${request.message}"에 대한 답변입니다. 이것은 FastAPI와 LangGraph 연동을 위한 모의 응답입니다.`,
    timestamp: new Date(),
    chatId: request.chatId || `chat_${Date.now()}`,
  }

  return {
    message: mockMessage,
    chatId: mockMessage.chatId,
  }
}
