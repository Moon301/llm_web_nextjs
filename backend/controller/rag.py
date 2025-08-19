
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List
import json
from langchain_community.document_loaders import PyPDFLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_community.vectorstores import FAISS
import tempfile
import os

router = APIRouter(
    prefix = "/api/chat",
    tags = ["chat"],
    responses={404:{"description": "Not Found"}},
)


def get_rag_key():
    import datetime
    import random
    
    now = datetime.datetime.now()
    timestamp = now.strftime("%Y%m%d%H%M%S")
    
    rand_num = random.randint(1000, 9999)
    
    rag_key = f"{timestamp}{rand_num}"
    return rag_key

@router.post("/rag")
async def rag_chat(
    message: str = Form(...),
    useOpenAI: str = Form(...),
    selectedModel: str = Form(...),
    conversationId: str = Form(""),
    conversationHistory: str = Form("[]"),
    ragKey: str = Form("")
):
    """
    RAG 채팅 엔드포인트
    - message: 사용자 메시지
    - useOpenAI: OpenAI 사용 여부 (true/false)
    - selectedModel: 선택된 모델명
    - conversationId: 대화 ID
    - conversationHistory: 대화 히스토리 (JSON 문자열)
    - ragKey: VectorDB 위치
    """
    try:
        # Form 데이터 파싱
        use_openai = useOpenAI.lower() == "true"
        conv_history = json.loads(conversationHistory) if conversationHistory else []
        
        print("===================")
        print(f"RAG Chat Request:")
        print(f"  Message: {message}")
        print(f"  Use OpenAI: {use_openai}")
        print(f"  Selected Model: {selectedModel}")
        print(f"  Conversation ID: {conversationId}")
        print(f"  Conversation History: {len(conv_history)} messages")
        print(f"  Rag Key: {ragKey}")
        
        # ragKey가 없으면 에러 반환
        if not ragKey:
            raise HTTPException(
                status_code=400, 
                detail="RAG Key가 필요합니다. 먼저 문서를 임베딩해주세요."
            )
        
        # VectorDB 경로 설정 및 확인
        DB_INDEX = f"../backend/vectors/{ragKey}"
        
        # VectorDB 디렉토리가 존재하는지 확인
        if not os.path.exists(DB_INDEX):
            raise HTTPException(
                status_code=400, 
                detail=f"VectorDB를 찾을 수 없습니다. '{ragKey}' 키로 먼저 문서를 임베딩해주세요."
            )
        
        try:
            embeddings = HuggingFaceEmbeddings(model_name="dragonkue/BGE-m3-ko")
            vector_db = FAISS.load_local(DB_INDEX, embeddings, allow_dangerous_deserialization=True)
            print(f"VectorDB 로딩 성공: {DB_INDEX}")
        except Exception as e:
            print(f"VectorDB 로딩 실패: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"VectorDB 로딩에 실패했습니다: {str(e)}"
            )
        
        retriever = vector_db.as_retriever(search_kwargs={"k": 5})
        
        # RAG 시스템 프롬프트 설정
        system_prompt = """당신은 문서 기반 질의응답을 도와주는 AI 어시스턴트입니다. 
        제공된 문서 내용을 바탕으로 정확하고 유용한 답변을 제공하세요.
        문서에 없는 내용에 대해서는 "문서에서 해당 내용을 찾을 수 없습니다"라고 답변하세요.
        
        ### Context
        {docs}
        """
        
        rag_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "{question}")
        ])
        
        find_docs = retriever.invoke(message)
        
        
        if use_openai:
            llm = ChatOpenAI(model=selectedModel, temperature=0)
        else:
            llm = ChatOllama(model=selectedModel, temperature=0)
            
        chain = rag_prompt | llm
        
        response = chain.invoke({"question": message, "docs": find_docs})
        ai_response = response.content

        print(f"RAG 응답 생성 완료: {len(ai_response)} 문자")
        
        return {
            "response": ai_response,
            "conversation_id": conversationId or f"rag_{len(conv_history)}",
            "model_info": {
                "provider": "OpenAI" if use_openai else "Local",
                "model": selectedModel
            },
            "status": "success",
            "rag_key": ragKey
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대화 히스토리 형식이 잘못되었습니다: {str(e)}")
    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        print(f"RAG 채팅 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"내부 서버 오류: {str(e)}")

@router.post("/embed")
async def embed_documents(
    files: List[UploadFile] = File([])
):
    """
    문서 임베딩 엔드포인트
    - files: 임베딩할 파일들
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Form 데이터 파싱
        
        # 파일 정보 로깅
        file_info = []
        split_docs = []
        
        for file in files:
            
            content = await file.read()
            file.seek(0)
            
            file_info.append({
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(content)
            })
            
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
            
        print
        
        print(f"Document Embedding Request:")
        print(f"  Files to embed: {len(files)} files")
        for info in file_info:
            print(f"    - {info['filename']} ({info['content_type']}, {info['size']} bytes)")
            
            
        rag_key = get_rag_key()
        
        
        for file in files:
            loader = PyPDFLoader(temp_file_path)
            docs = loader.load()
            
            chunk = RecursiveCharacterTextSplitter(chunk_size = 1000, chunk_overlap = 50)
            
            split_docs.extend(chunk.split_documents(docs))
            
        embed_model = HuggingFaceEmbeddings(model_name ="dragonkue/BGE-m3-ko")
        
        vector_db = FAISS.from_documents(split_docs, embed_model)
        
        
        DB_INDEX = f"../backend/vectors/{rag_key}"
        vector_db.save_local(DB_INDEX)
        
        # 임시 응답 (실제 구현 시 교체 필요)
        embedding_result = {
            "status": "success",
            "message": "임베딩이 완료되었습니다",
            "files_processed": len(files),
            "vector_db": "Faiss",
            "files": [info["filename"] for info in file_info],
            "rag_key": rag_key
        }
        
        print(f"Embedding completed successfully:")
        print(f"  Processed files: {len(files)}")
        
        return embedding_result
        
    except Exception as e:
        print(f"Embedding failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")