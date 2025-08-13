import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title } = await request.json()
    const chatId = params.id

    // TODO: Replace with actual database update
    // const updatedChat = await updateChatTitle(chatId, title)

    // Mock response for now
    const mockUpdatedChat = {
      id: chatId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(mockUpdatedChat)
  } catch (error) {
    console.error("Update chat title error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
