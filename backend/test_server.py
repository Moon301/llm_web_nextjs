from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Test Server")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test Server is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Test Server"}

@app.post("/api/chat")
async def test_chat():
    return {"response": "This is a test response", "conversation_id": "test_123"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
