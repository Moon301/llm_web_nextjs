import { NextResponse } from "next/server"
import type { ChatSession } from "@/types/chat"

// Mock data - replace with actual database integration
const mockChats: ChatSession[] = [
  {
    id: "1",
    title: "AI 어시스턴트와의 대화",
    messages: [],
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    title: "프로젝트 기획 논의",
    messages: [],
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },
]

export async function GET() {
  try {
    // TODO: Replace with actual database query
    return NextResponse.json(mockChats)
  } catch (error) {
    console.error("Get chats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
