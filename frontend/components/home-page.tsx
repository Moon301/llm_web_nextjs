"use client"

import { Bot, MessageSquare, Database, BarChart3, Zap, Shield, Globe, Code } from "lucide-react"

export function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KETI Chat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI 기반 대화형 챗봇 플랫폼으로, 다양한 AI 모델을 활용한 지능적인 대화와 문서 기반 검색을 제공합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Q&A 채팅</h3>
            <p className="text-gray-600">
              일반적인 질문과 답변을 위한 AI 채팅입니다. 다양한 주제에 대해 지능적인 응답을 받을 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">RAG 채팅</h3>
            <p className="text-gray-600">
              문서 기반 검색 증강 생성 채팅입니다. PDF 문서를 업로드하고 해당 내용에 대한 질문을 할 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">모델 비교</h3>
            <p className="text-gray-600">
              여러 AI 모델의 응답을 비교해보세요. 각 모델의 특성과 성능을 직접 체험할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Available Models */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">사용 가능한 AI 모델</h2>
            <p className="text-lg text-gray-600">
              OpenAI와 Ollama의 다양한 모델을 선택하여 사용할 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* OpenAI Models */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">OpenAI</h3>
                  <p className="text-sm text-gray-600">2015년 설립, AI 연구 및 상용화 선도 기업</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* GPT-3.5 Turbo */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">GPT-3.5 Turbo</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">2022년 11월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    GPT-3 기반의 대화형 모델로, 빠른 응답과 비용 효율성이 특징입니다.
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> 빠른 응답, 저비용, 대화 최적화
                  </div>
                </div>

                {/* GPT-4o */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">GPT-4o</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">2024년 5월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    멀티모달 AI 모델로, 텍스트, 이미지, 오디오를 모두 처리할 수 있습니다.
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> 멀티모달, 고성능, 창의적 사고
                  </div>
                </div>

                {/* GPT-4o Mini */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">GPT-4o Mini</h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">2024년 5월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    GPT-4o의 경량화 버전으로, 비슷한 성능을 더 저렴한 비용으로 제공합니다.
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> 경량화, 비용 효율, GPT-4o 유사 성능
                  </div>
                </div>
              </div>
            </div>

            {/* Ollama Models */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Ollama</h3>
                  <p className="text-sm text-gray-600">2023년 설립, 오픈소스 AI 모델 실행 플랫폼</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* GPT-OSS (OpenAI 오픈웨이트) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">GPT-OSS (20B / 120B)</h4>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">2025년 8월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">OpenAI가 공개한 오픈 가중치 텍스트 모델. 함수 호출·구조적 출력 지원.</p>
                  <div className="text-xs text-gray-500"><span className="font-medium">특징:</span> 120B(80GB GPU), 20B(16GB 메모리)에서도 실행 가능·로컬 추론 적합·강력한 추론 성능</div>
                </div>

                {/* Gemma 3 */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Gemma 3</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">2025년 3월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Google이 공개한 경량·멀티모달 오픈웨이트 모델. 최대 128K 토큰 컨텍스트 및 140여 개 언어 지원, 함수 호출 및 시각 이해 가능.</p>
                  <div className="text-xs text-gray-500"><span className="font-medium">특징:</span> 초장 컨텍스트·멀티모달·경량화 설계·다국어 대응</div>
                </div>

                {/* Phi Models */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Phi 시리즈</h4>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">2023년</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Microsoft에서 개발한 고품질 소규모 언어 모델입니다.
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">모델:</span> Phi4:14B, Phi3:14B, Phi2:2.7B
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> Microsoft 개발, 고품질, 효율적 학습
                  </div>
                </div>

                {/* Qwen 3 */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Qwen 3</h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">2025년 4월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Alibaba 계열 최신. 다국어·긴 컨텍스트·합리적 추론 성능.</p>
                  <div className="text-xs text-gray-500"><span className="font-medium">특징:</span> 128K+ 컨텍스트, 다양한 크기</div>
                </div>

                {/* Llama Models */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Llama 시리즈</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">2023년</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Meta에서 개발한 오픈소스 대규모 언어 모델입니다.
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">모델:</span> Llama3.3:latest, Llama3:8B, Llama3:70B
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> Meta 개발, 오픈소스, 커뮤니티 활발
                  </div>
                </div>
              </div>
            </div>
          </div>

         
          
        </div>

        {/* Technical Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">기술적 특징</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">Next.js 14</span>
                  <p className="text-sm text-gray-600">최신 React 프레임워크로 구축된 현대적인 UI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">FastAPI</span>
                  <p className="text-sm text-gray-600">Python 기반 고성능 백엔드 API</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">LangGraph</span>
                  <p className="text-sm text-gray-600">AI 워크플로우 및 상태 관리</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">Tailwind CSS</span>
                  <p className="text-sm text-gray-600">유틸리티 우선 CSS 프레임워크</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">주요 기능</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">실시간 채팅</span>
                  <p className="text-sm text-gray-600">AI와의 자연스러운 대화</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">문서 업로드</span>
                  <p className="text-sm text-gray-600">PDF 파일 기반 질의응답</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">모델 선택</span>
                  <p className="text-sm text-gray-600">다양한 AI 모델 중 선택</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-900">대화 기록</span>
                  <p className="text-sm text-gray-600">탭별 독립적인 대화 관리</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}