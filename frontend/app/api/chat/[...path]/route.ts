import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = new URL(request.url)
  const queryString = url.search.toString()
  
  try {
    const response = await fetch(`http://127.0.0.1:8002/api/chat/${path}${queryString ? '?' + queryString : ''}`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend request failed:', error)
    return NextResponse.json({ error: 'Backend request failed' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const body = await request.json()
  
  try {
    console.log('Forwarding request to backend:', `http://127.0.0.1:8002/api/chat/${path}`)
    console.log('Request body:', body)
    
    const response = await fetch(`http://127.0.0.1:8002/api/chat/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend request failed:', error)
    return NextResponse.json({ error: 'Backend request failed' }, { status: 500 })
  }
}
