import { type NextRequest, NextResponse } from "next/server"
import type { ChatSession } from "@/types/chat"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title } = body

    // TODO: Replace with actual database creation
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: title || "새로운 채팅",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newChat)
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
