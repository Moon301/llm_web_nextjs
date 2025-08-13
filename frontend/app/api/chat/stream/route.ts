import type { NextRequest } from "next/server"
import type { ChatRequest } from "@/types/chat"

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    // Create a readable stream for streaming responses
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // TODO: Replace with actual FastAPI streaming call
          await streamFromFastAPI(body, controller)
        } catch (error) {
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Stream API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}

// Mock streaming function - replace with actual FastAPI streaming
async function streamFromFastAPI(request: ChatRequest, controller: ReadableStreamDefaultController) {
  // This is where you'll integrate with your FastAPI streaming endpoint
  // Example:
  // const response = await fetch('http://your-fastapi-server/chat/stream', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // })

  // Mock streaming response
  const mockResponse = `안녕하세요! "${request.message}"에 대한 스트리밍 응답입니다. FastAPI와 LangGraph를 통해 실시간으로 응답을 생성하고 있습니다.`

  const words = mockResponse.split(" ")

  for (let i = 0; i < words.length; i++) {
    const chunk = words[i] + (i < words.length - 1 ? " " : "")
    controller.enqueue(new TextEncoder().encode(chunk))

    // Simulate streaming delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
