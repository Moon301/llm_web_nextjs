from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from controller import qna

# 환경 변수 로드
load_dotenv()

app = FastAPI(title="AI Chat API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(qna.router)

# Pydantic 모델
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    tab_type: str  # "qna", "rag", "compare"
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None

# LangGraph 상태 정의 - 딕셔너리 기반
class ChatState(dict):
    def __init__(self, messages: List[Dict[str, Any]] = None):
        super().__init__()
        self["messages"] = messages or []
    
    def add_message(self, role: str, content: str):
        self["messages"].append({"role": role, "content": content})
    
    def get_messages(self):
        return self["messages"]

# OpenAI 모델 초기화
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

# LangGraph 노드 함수들
def process_user_message(state: ChatState) -> ChatState:
    """사용자 메시지 처리"""
    # 마지막 사용자 메시지 가져오기
    user_message = state["messages"][-1]["content"]
    return state

def generate_ai_response(state: ChatState) -> ChatState:
    """AI 응답 생성 - 탭 타입에 따라 다른 시스템 프롬프트 사용"""
    global current_tab_type
    
    # 탭 타입에 따른 시스템 프롬프트 설정
    system_prompts = {
        "qna": "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요.",
        "rag": "당신은 문서 기반 검색 증강 생성(RAG) 시스템입니다. 제공된 문서 정보를 바탕으로 정확한 답변을 생성하세요.",
        "compare": "여러 AI 모델의 응답을 비교 분석하는 시스템입니다. 객관적이고 균형 잡힌 분석을 제공하세요."
    }
    
    system_prompt = system_prompts.get(current_tab_type, system_prompts["qna"])
    
    # LangChain 메시지 형식으로 변환 (시스템 프롬프트 포함)
    langchain_messages = [HumanMessage(content=system_prompt)]
    for msg in state["messages"]:
        if msg["role"] == "user":
            langchain_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            langchain_messages.append(AIMessage(content=msg["content"]))
    
    # AI 응답 생성
    response = llm.invoke(langchain_messages)
    
    # 응답을 상태에 추가
    state.add_message("assistant", response.content)
    return state

def should_continue(state: ChatState) -> str:
    """다음 단계 결정"""
    return "continue" if len(state["messages"]) > 0 else END

# LangGraph 워크플로우 생성
def create_chat_workflow():
    workflow = StateGraph(ChatState)
    
    # 노드 추가
    workflow.add_node("process_user", process_user_message)
    workflow.add_node("generate_response", generate_ai_response)
    
    # 엣지 추가
    workflow.add_edge("process_user", "generate_response")
    workflow.add_edge("generate_response", END)
    
    # 시작점 설정
    workflow.set_entry_point("process_user")
    
    return workflow.compile()

# 전역 변수로 tab_type 저장 (임시 해결책)
current_tab_type = "qna"

def set_tab_type(tab_type: str):
    global current_tab_type
    current_tab_type = tab_type

# 워크플로우 인스턴스 생성
chat_workflow = create_chat_workflow()

# 탭 타입별 워크플로우 실행 함수
def run_chat_workflow(state: ChatState, tab_type: str):
    """탭 타입에 따라 워크플로우 실행"""
    try:
        # 전역 변수에 tab_type 설정
        set_tab_type(tab_type)
        # 워크플로우 실행
        result = chat_workflow.invoke(state)
        return result
    except Exception as e:
        print(f"LangGraph 워크플로우 실행 오류: {e}")
        raise e

@app.get("/")
async def root():
    return {"message": "AI Chat API with LangGraph"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"=== Chat Request Debug ===")
        print(f"Message: {request.message}")
        print(f"Tab Type: {request.tab_type}")
        print(f"Conversation History: {request.conversation_history}")
        
        # 상태 초기화
        state = ChatState()
        print(f"Initial State: {state}")
        print(f"State messages: {state.get_messages()}")
        
        # 대화 기록 추가
        for msg in request.conversation_history:
            state.add_message(msg.role, msg.content)
        
        # 사용자 메시지 추가
        state.add_message("user", request.message)
        print(f"After adding user message: {state.get_messages()}")
        
        # LangGraph 워크플로우 대신 직접 OpenAI API 호출
        try:
            # 탭 타입에 따른 시스템 프롬프트 설정
            system_prompts = {
                "qna": "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요.",
                "rag": "당신은 문서 기반 검색 증강 생성(RAG) 시스템입니다. 제공된 문서 정보를 바탕으로 정확한 답변을 생성하세요.",
                "compare": "여러 AI 모델의 응답을 비교 분석하는 시스템입니다. 객관적이고 균형 잡힌 분석을 제공하세요."
            }
            
            system_prompt = system_prompts.get(request.tab_type, system_prompts["qna"])
            
            # LangChain 메시지 형식으로 변환
            langchain_messages = [HumanMessage(content=system_prompt)]
            for msg in state.get_messages():
                if msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(AIMessage(content=msg["content"]))
            
            # AI 응답 생성
            response = llm.invoke(langchain_messages)
            ai_response = response.content
            
            print(f"OpenAI API response: {ai_response}")
            
        except Exception as e:
            print(f"OpenAI API 호출 오류: {e}")
            # 폴백 응답
            ai_response = f"[{request.tab_type.upper()}] 시스템 오류로 인해 기본 응답을 제공합니다: {request.message}에 대한 답변입니다."
        
        if not ai_response:
            raise HTTPException(status_code=500, detail="AI 응답 생성 실패")
        
        return ChatResponse(
            response=ai_response,
            conversation_id="conv_" + str(hash(str(request.message)))
        )
        
    except Exception as e:
        print(f"=== Error in chat endpoint ===")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AI Chat API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
