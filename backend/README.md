# AI Chat Backend with FastAPI & LangGraph

이 프로젝트는 FastAPI와 LangGraph를 사용하여 AI 채팅 시스템을 구현한 백엔드입니다.

## 설치 및 설정

### 1. Python 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate  # Windows
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 열어서 OPENAI_API_KEY를 설정하세요
```

### 4. 서버 실행
```bash
python main.py
# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

- `GET /`: API 상태 확인
- `GET /api/health`: 헬스 체크
- `POST /api/chat`: 채팅 메시지 전송

## LangGraph 워크플로우

현재 구현된 워크플로우:
1. **process_user**: 사용자 메시지 처리
2. **generate_response**: AI 응답 생성

## 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키 (필수)
- `HOST`: 서버 호스트 (기본값: 0.0.0.0)
- `PORT`: 서버 포트 (기본값: 8000)
- `FRONTEND_URL`: 프론트엔드 URL (CORS용)

## 개발 모드

개발 모드로 실행하려면:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

`--reload` 플래그는 코드 변경 시 자동으로 서버를 재시작합니다.

. venv/bin/activate
uvicorn main:app --reload --port 8001