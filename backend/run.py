#!/usr/bin/env python3
"""
FastAPI + LangGraph 백엔드 서버 실행 스크립트
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 AI Chat Backend 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:8001")
    print("📚 API 문서: http://localhost:8001/docs")
    print("🔧 LangGraph 워크플로우가 활성화되었습니다.")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,  # 개발 모드에서 코드 변경 시 자동 재시작
        log_level="info"
    )
