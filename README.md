# AI Chat Web Application with Next.js, FastAPI & LangGraph

이 프로젝트는 Next.js 프론트엔드와 FastAPI + LangGraph 백엔드를 연동한 AI 채팅 웹 애플리케이션입니다.

## 🏗️ 프로젝트 구조

```
llm_web_nextjs/
├── frontend/                 # Next.js 프론트엔드
│   ├── components/          # React 컴포넌트
│   ├── hooks/              # React 훅
│   ├── lib/                # 유틸리티 및 API 클라이언트
│   ├── types/              # TypeScript 타입 정의
│   └── app/                # Next.js 앱 라우터
├── backend/                 # FastAPI + LangGraph 백엔드
│   ├── main.py             # FastAPI 메인 애플리케이션
│   ├── run.py              # 서버 실행 스크립트
│   ├── requirements.txt    # Python 의존성
│   └── env.example        # 환경 변수 예시
└── README.md               # 프로젝트 설명서
```

## 🚀 빠른 시작

### 1. 백엔드 설정 및 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# Python 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate     # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp env.example .env
# .env 파일을 열어서 OPENAI_API_KEY를 설정하세요

# 서버 실행
python run.py
# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 프론트엔드 실행

```bash
# 새 터미널에서 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 🔗 FastAPI와의 연동 방식

### API 엔드포인트

- **POST /api/chat**: 채팅 메시지 전송
  - Request Body:
    ```json
    {
      "message": "사용자 메시지",
      "tab_type": "qna|rag|compare",
      "conversation_history": []
    }
    ```
  - Response:
    ```json
    {
      "response": "AI 응답",
      "conversation_id": "대화 ID"
    }
    ```

### LangGraph 워크플로우

1. **process_user**: 사용자 메시지 처리
2. **generate_response**: 탭 타입에 따른 AI 응답 생성
   - **qna**: 일반적인 질문답변
   - **rag**: 문서 기반 검색 증강 생성
   - **compare**: AI 모델 비교 분석

### 프론트엔드 연동

- `useChat` 훅에서 `sendMessage(message, activeTab)` 호출
- `activeTab`에 따라 다른 시스템 프롬프트 적용
- 탭 변경 시 대화 내용 자동 초기화

## 🎯 주요 기능

### 1. QnA 채팅
- 일반적인 질문과 답변
- 친근하고 도움이 되는 AI 어시스턴트

### 2. RAG 채팅
- 문서 기반 검색 증강 생성
- 정확한 문서 정보 기반 답변

### 3. 모델 비교
- 여러 AI 모델의 응답 비교 분석
- 객관적이고 균형 잡힌 분석 제공

## 🔧 개발 환경

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.8+, LangGraph, LangChain
- **AI Model**: OpenAI GPT-3.5-turbo (OpenAI API 키 필요)

## 📝 환경 변수

백엔드 `.env` 파일에 다음을 설정하세요:

```bash
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 🌐 접속 주소

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 🔄 개발 워크플로우

1. 백엔드 서버 실행 (`python run.py`)
2. 프론트엔드 개발 서버 실행 (`npm run dev`)
3. 브라우저에서 http://localhost:3000 접속
4. 탭을 변경하여 다른 AI 모드 테스트
5. LangGraph 워크플로우 로그 확인

## 🚨 주의사항

- OpenAI API 키가 필요합니다
- 백엔드 서버가 실행 중이어야 프론트엔드가 정상 작동합니다
- CORS 설정이 프론트엔드 주소(http://localhost:3000)로 되어 있습니다
