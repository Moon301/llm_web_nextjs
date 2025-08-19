import os
import json

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Form

from typing_extensions import TypedDict, Annotated

from langchain_openai import ChatOpenAI



load_dotenv()
os.environ["LANGCHAIN_ENDPONIT"] = "http://api.smith.langchain.com"
os.environ["LANGSMITH_PROJECT"] = "quality_answer"


router = APIRouter(
    prefix = "/api/quality",
    tags = ["chat"],
    responses={404:{"description": "Not Found"}},
)


@router.post("/gpt35")
async def quality_chat_gpt35(
    message: str = Form(...),
    conversationId: str = Form(""),
    conversationHistory: str = Form("[]"),
):

    try:

        conv_history = json.loads(conversationHistory) if conversationHistory else []
        
        print("===================")
        print(f" Quality Chat Request:")
        print(f" Selected Model: gpt-3.5-turbo")
        print(f" Message: {message}")
        print(f" Conversation ID: {conversationId}")
        print(f" Conversation History: {len(conv_history)} messages")

        

        llm = ChatOpenAI(model = "gpt-3.5-turbo", temperature = 0.5)
        
        response = llm.invoke(message)
        
        ai_response = response.content

        print(f"GPT 3.5 turbo 응답 생성 완료: {len(ai_response)} 문자")
        
        return {
            "response": ai_response,
            "conversation_id": conversationId or f"quality_{len(conv_history)}",
            "status": "success",
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대화 히스토리 형식이 잘못되었습니다: {str(e)}")
    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        print(f"Quality 채팅 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"내부 서버 오류: {str(e)}")
    

@router.post("/gpt4o")
async def quality_chat_gpt4o(
    orgQuestion: str = Form(...),
    orgAnswer: str = Form(...),
):

    try:
        
        print("===================")
        print(f" Quality Chat Request:")
        print(f" Selected Model: gpt-4o")
        print(f" Original Message: {orgQuestion}")
        print(f" Original Answer: {orgAnswer}")

        

        llm = ChatOpenAI(model = "gpt-4o", temperature = 0.5)
        
        # System prompt for enhancing existing answers
        system_prompt = """당신은 사용자의 질문과 이전에 답변했던 내용을 분석하여 더욱 향상된 답변을 제공하는 AI 어시스턴트입니다.

        사용자의 원래 질문과 기존 AI 답변을 모두 고려하여 다음과 같이 개선해주세요:

        1. **질문 맞춤형 개선**: 사용자가 실제로 궁금해하는 부분에 더 집중하여 답변
        2. **구체성 향상**: 추상적인 설명을 구체적인 예시와 함께 제시
        3. **구조화**: 정보를 논리적 순서로 정리하고 단계별로 설명
        4. **실용성**: 실제 적용 가능한 방법과 팁 추가
        5. **완성도**: 사용자 질문에서 요구하는 정보가 누락되었다면 보완
        6. **가독성**: 복잡한 개념을 사용자가 이해하기 쉽게 설명

        기존 답변의 장점은 유지하면서, 사용자의 원래 질문 의도에 더 부합하는 유용하고 실용적인 정보를 제공하세요.
        답변은 마크다운 형식으로 작성하고, 필요시 목록, 강조, 코드 예시 등을 활용하세요."""

        # Create messages with system prompt and user message
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"사용자 질문: {orgQuestion}\n\n기존 AI 답변: {orgAnswer}\n\n위 질문과 답변을 바탕으로 더욱 향상된 답변을 제공해주세요."}
        ]
        
        response = llm.invoke(messages)
        
        ai_response = response.content

        print(f"GPT 4o 응답 생성 완료: {len(ai_response)} 문자")
        
        return {
            "response": ai_response,
            "status": "success",
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대화 히스토리 형식이 잘못되었습니다: {str(e)}")
    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        print(f"Quality 채팅 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"내부 서버 오류: {str(e)}")
