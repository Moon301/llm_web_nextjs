from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import json

# 환경 변수 로드
load_dotenv()

router = APIRouter(
    prefix = "/api/chat",
    tags = ["chat"],
    responses={404:{"description": "Not Found"}},
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
    use_openai: Optional[bool] = True
    select_model: Optional[str] = "gpt-3.5-turbo"
    conversation_id: Optional[str] = None  # 대화 ID 추가

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None
    model_info: Optional[Dict[str, str]] = None

# LangGraph 상태 정의 - 딕셔너리 기반
class ChatState(dict):
    def __init__(self, messages: List[Dict[str, Any]] = None, conversation_id: str = None):
        super().__init__()
        self["messages"] = messages or []
        self["conversation_id"] = conversation_id or f"conv_{hash(str(messages))}"
    
    def add_message(self, role: str, content: str):
        self["messages"].append({"role": role, "content": content})
    
    def get_messages(self):
        return self["messages"]
    
    def get_conversation_id(self):
        return self["conversation_id"]

# LLM 모델 초기화 함수
def get_llm(use_openai: bool, select_model: str):
    if use_openai:
        print(f"Using OpenAI model: {select_model}")
        return ChatOpenAI(
            model=select_model,
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
    else:
        print(f"Using Ollama model: {select_model}")
        # Ollama 모델 사용
        return ChatOllama(
            model=select_model,
            temperature=0.7
        )

# LangGraph 노드 함수들
def process_user_message(state: ChatState) -> ChatState:
    """사용자 메시지 처리"""
    # 마지막 사용자 메시지 가져오기
    user_message = state["messages"][-1]["content"]
    print(f"Processing user message: {user_message[:100]}...")
    return state

def generate_ai_response(state: ChatState) -> ChatState:
    """AI 응답 생성 - 탭 타입에 따라 다른 시스템 프롬프트 사용"""
    try:
        # 탭 타입에 따른 시스템 프롬프트 설정
        system_prompts = {
            "qna": "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요. 이전 대화 맥락을 고려하여 일관성 있는 답변을 해주세요.",
            "rag": "당신은 문서 기반 검색 증강 생성(RAG) 시스템입니다. 제공된 문서 정보를 바탕으로 정확한 답변을 생성하세요.",
            "compare": "여러 AI 모델의 응답을 비교 분석하는 시스템입니다. 객관적이고 균형 잡힌 분석을 제공하세요."
        }
        
        # 현재 상태에서 tab_type 추출 (기본값: qna)
        tab_type = state.get("tab_type", "qna")
        system_prompt = system_prompts.get(tab_type, system_prompts["qna"])
        
        # LangChain 메시지 형식으로 변환
        langchain_messages = [SystemMessage(content=system_prompt)]
        
        # 대화 기록을 LangChain 메시지로 변환
        for msg in state["messages"]:
            if msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["content"]))
        
        # 현재 설정된 모델로 LLM 선택
        use_openai = state.get("use_openai", True)
        select_model = state.get("select_model", "gpt-3.5-turbo")
        
        llm = get_llm(use_openai, select_model)
        
        # AI 응답 생성
        response = llm.invoke(langchain_messages)
        ai_response = response.content
        
        # 응답을 상태에 추가
        state.add_message("assistant", ai_response)
        
        print(f"Generated AI response: {ai_response[:100]}...")
        
        return state
        
    except Exception as e:
        print(f"Error in generate_ai_response: {e}")
        # 에러 발생 시 기본 응답 생성
        state.add_message("assistant", f"죄송합니다. 응답 생성 중 오류가 발생했습니다: {str(e)}")
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
    
    return workflow

# 간단한 메모리 관리 (MemorySaver 대신)
class SimpleMemoryManager:
    def __init__(self):
        self.conversations = {}
    
    def get(self, conversation_id: str):
        return self.conversations.get(conversation_id)
    
    def put(self, conversation_id: str, state):
        self.conversations[conversation_id] = state
        print(f"State saved for conversation: {conversation_id}")
    
    def clear(self, conversation_id: str):
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]

def get_memory_saver():
    """간단한 메모리 매니저 인스턴스 생성"""
    try:
        memory = SimpleMemoryManager()
        print("SimpleMemoryManager initialized successfully")
        return memory
        
    except Exception as e:
        print(f"Error initializing SimpleMemoryManager: {e}")
        print("Falling back to basic memory management")
        return None

# 전역 워크플로우 인스턴스
chat_workflow = None
memory_saver = None

def get_or_create_workflow():
    """워크플로우와 MemorySaver를 생성하거나 기존 것을 반환"""
    global chat_workflow, memory_saver
    
    if chat_workflow is None:
        # 기본 워크플로우 생성
        workflow = create_chat_workflow()
        
        # MemorySaver 설정
        memory_saver = get_memory_saver()
        if memory_saver:
            print("MemorySaver initialized (will be used in invoke)")
        
        # 컴파일
        chat_workflow = workflow.compile()
        print("Chat workflow compiled")
    
    return chat_workflow

@router.post("/qna", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"=== Chat Request Debug ===")
        print(f"Message: {request.message}")
        print(f"Tab Type: {request.tab_type}")
        print(f"Use OpenAI: {request.use_openai}")
        print(f"Selected Model: {request.select_model}")
        print(f"Conversation ID: {request.conversation_id}")
        print(f"Conversation History Length: {len(request.conversation_history)}")
        
        # 워크플로우 가져오기
        workflow = get_or_create_workflow()
        
        # 대화 ID 생성 또는 기존 것 사용
        conversation_id = request.conversation_id or f"conv_{hash(str(request.message))}"
        
        # 기존 대화 상태 복원 또는 새로 생성
        if request.conversation_id and memory_saver:
            try:
                # MemorySaver에서 기존 상태 복원
                existing_state = memory_saver.get(conversation_id)
                if existing_state and existing_state.get("messages"):
                    print(f"Restored existing conversation state: {conversation_id}")
                    print(f"Existing messages count: {len(existing_state['messages'])}")
                    state = existing_state
                else:
                    print(f"No existing state found, creating new: {conversation_id}")
                    state = ChatState(conversation_id=conversation_id)
            except Exception as e:
                print(f"Error restoring state: {e}")
                state = ChatState(conversation_id=conversation_id)
        else:
            print(f"Creating new conversation state: {conversation_id}")
            state = ChatState(conversation_id=conversation_id)
        
        # 상태에 메타데이터 추가
        state["tab_type"] = request.tab_type
        state["use_openai"] = request.use_openai
        state["select_model"] = request.select_model
        
        # 대화 기록 추가 (기존 기록이 없거나 새 대화인 경우)
        if not state["messages"] and request.conversation_history:
            print(f"Adding conversation history: {len(request.conversation_history)} messages")
            for msg in request.conversation_history:
                state.add_message(msg.role, msg.content)
        elif state["messages"]:
            print(f"Using existing messages: {len(state['messages'])} messages")
        else:
            print("No conversation history to add")
        
        # 사용자 메시지 추가
        state.add_message("user", request.message)
        print(f"Current state messages count: {len(state['messages'])}")
        
        # LangGraph 워크플로우 실행
        try:
            print("Executing LangGraph workflow...")
            
            # 간단한 워크플로우 실행
            result = workflow.invoke(state)
            print(f"Workflow execution completed")
            
            # AI 응답 추출
            ai_response = None
            for msg in result["messages"]:
                if msg["role"] == "assistant":
                    ai_response = msg["content"]
                    break
            
            if not ai_response:
                raise Exception("AI response not found in workflow result")
            
            print(f"AI Response generated: {ai_response[:100]}...")
            
        except Exception as e:
            print(f"LangGraph workflow execution error: {e}")
            # 폴백: 직접 LLM 호출
            print("Falling back to direct LLM call...")
            
            try:
                # 시스템 프롬프트 설정
                system_prompts = {
                    "qna": "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요.",
                    "rag": "당신은 문서 기반 검색 증강 생성(RAG) 시스템입니다. 제공된 문서 정보를 바탕으로 정확한 답변을 생성하세요.",
                    "compare": "여러 AI 모델의 응답을 비교 분석하는 시스템입니다. 객관적이고 균형 잡힌 분석을 제공하세요."
                }
                
                system_prompt = system_prompts.get(request.tab_type, system_prompts["qna"])
                
                # LangChain 메시지 형식으로 변환
                langchain_messages = [SystemMessage(content=system_prompt)]
                for msg in state["messages"]:
                    if msg["role"] == "user":
                        langchain_messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        langchain_messages.append(AIMessage(content=msg["content"]))
                
                # 모델 설정에 따라 LLM 선택
                llm = get_llm(request.use_openai, request.select_model)
                
                # AI 응답 생성
                response = llm.invoke(langchain_messages)
                ai_response = response.content
                
                # 상태에 AI 응답 추가
                state.add_message("assistant", ai_response)
                
                print(f"Fallback LLM response: {ai_response[:100]}...")
                
            except Exception as fallback_error:
                print(f"Fallback LLM call also failed: {fallback_error}")
                ai_response = f"[{request.tab_type.upper()}] 시스템 오류로 인해 기본 응답을 제공합니다: {request.message}에 대한 답변입니다."
                state.add_message("assistant", ai_response)
        
        if not ai_response:
            raise HTTPException(status_code=500, detail="AI 응답 생성 실패")
        
        # MemorySaver에 상태 저장
        if memory_saver:
            try:
                print(f"Saving state to MemorySaver: {conversation_id}")
                print(f"State to save: {state}")
                memory_saver.put(conversation_id, state)
                print(f"State saved to MemorySaver: {conversation_id}")
                
                # 저장된 상태 확인
                saved_state = memory_saver.get(conversation_id)
                if saved_state:
                    print(f"Verified saved state: {len(saved_state.get('messages', []))} messages")
                else:
                    print("Warning: Saved state not found after saving")
                    
            except Exception as e:
                print(f"Error saving state to MemorySaver: {e}")
                import traceback
                traceback.print_exc()
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            model_info={
                "provider": "OpenAI" if request.use_openai else "Ollama",
                "model": request.select_model
            }
        )
        
    except Exception as e:
        print(f"=== Error in chat endpoint ===")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))