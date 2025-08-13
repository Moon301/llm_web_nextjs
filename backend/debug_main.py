from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

app = FastAPI(title="AI Chat API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    tab_type: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AI Chat API - Debug Version"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AI Chat API - Debug"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"Received request: {request}")
        
        # 간단한 응답 생성 (LangGraph 없이)
        system_prompts = {
            "qna": "당신은 친근하고 도움이 되는 AI 어시스턴트입니다.",
            "rag": "당신은 문서 기반 검색 증강 생성(RAG) 시스템입니다.",
            "compare": "여러 AI 모델의 응답을 비교 분석하는 시스템입니다."
        }
        
        system_prompt = system_prompts.get(request.tab_type, system_prompts["qna"])
        
        # 간단한 응답 (실제로는 OpenAI API 호출)
        response_text = f"[{request.tab_type.upper()}] {system_prompt}\n\n사용자: {request.message}\n\nAI: 안녕하세요! {request.tab_type} 모드에서 도움을 드리겠습니다."
        
        return ChatResponse(
            response=response_text,
            conversation_id=f"debug_{hash(request.message)}"
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Debug AI Chat Backend 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:8001")
    print("📚 API 문서: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
