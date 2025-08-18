from fastapi import APIRouter, HTTPException, Form
from dotenv import load_dotenv
import json
from langchain_ollama import ChatOllama

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from langgraph.graph import StateGraph, END

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


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

class ModelInfo(BaseModel):
    provider: str
    model: str

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
    model_info: Optional[ModelInfo] = None
    status: Optional[str] = "success"


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
        # Ollama 모델 사용 (--network host로 호스트 네트워크 직접 사용)
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


@router.post("/compare", response_model=ChatResponse)
async def compare_models(
    message: str = Form(...),
    conversationId: str = Form(""),
    conversationHistory: str = Form("[]"),
    selectedModel: str = Form(...),  # 단일 모델 처리
    useOpenAI: str = Form("false")
):
    """
    모델 비교 엔드포인트 - 단일 모델 처리 (프론트엔드에서 3개 모델을 개별적으로 요청)
    """
    try:
        print(f"=== Compare Model Request Debug ===")
        print(f"Message: {message}")
        print(f"Selected Model: {selectedModel}")
        print(f"Conversation ID: {conversationId}")
        print(f"Use OpenAI: {useOpenAI}")
        
        # Form 데이터 파싱
        use_openai = useOpenAI.lower() == "true"
        conv_history = json.loads(conversationHistory) if conversationHistory else []
        print(f"Conversation History Length: {len(conv_history)}")
        
        # 대화 ID 생성 또는 기존 것 사용
        conversation_id = conversationId or f"compare_{hash(str(message))}"
        
        # 기존 대화 상태 복원 또는 새로 생성
        if conversationId and memory_saver:
            try:
                existing_state = memory_saver.get(conversation_id)
                if existing_state and existing_state.get("messages"):
                    print(f"Restored existing conversation state: {conversation_id}")
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
        state["tab_type"] = "compare"
        state["use_openai"] = use_openai
        state["select_model"] = selectedModel
        
        # 대화 기록 추가
        if not state["messages"] and conv_history:
            print(f"Adding conversation history: {len(conv_history)} messages")
            for msg in conv_history:
                state.add_message(msg["role"], msg["content"])
        
        # 사용자 메시지 추가
        state.add_message("user", message)
        print(f"Current state messages count: {len(state['messages'])}")
        
        try:
            # 시스템 프롬프트 설정
            system_prompt = "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요."
            
            # LangChain 메시지 형식으로 변환
            langchain_messages = [SystemMessage(content=system_prompt)]
            for msg in state["messages"]:
                if msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(AIMessage(content=msg["content"]))
            
            # 모델 설정에 따라 LLM 선택
            llm = get_llm(use_openai, selectedModel)
            
            # AI 응답 생성
            response = llm.invoke(langchain_messages)
            ai_response = response.content
            
            # 응답을 상태에 추가
            state.add_message("assistant", ai_response)
            
            # 메모리에 상태 저장
            if memory_saver:
                memory_saver.put(conversation_id, state)
            
            print(f"Compare Model Response generated: {ai_response[:100]}...")
            
            return ChatResponse(
                response=ai_response,
                conversation_id=conversation_id,
                model_info=ModelInfo(
                    provider="Local" if not use_openai else "OpenAI",
                    model=selectedModel
                ),
                status="success"
            )
            
        except Exception as e:
            print(f"Error in compare model response generation: {e}")
            error_response = f"죄송합니다. 모델 응답 생성 중 오류가 발생했습니다: {str(e)}"
            
            # 에러 응답을 상태에 추가
            state.add_message("assistant", error_response)
            
            # 메모리에 상태 저장
            if memory_saver:
                memory_saver.put(conversation_id, state)
            
            return ChatResponse(
                response=error_response,
                conversation_id=conversation_id,
                model_info=ModelInfo(
                    provider="Local" if not use_openai else "OpenAI",
                    model=selectedModel
                ),
                status="error"
            )
            
    except Exception as e:
        print(f"Compare models error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Compare models failed: {str(e)}")