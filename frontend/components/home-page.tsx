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
                {/* GPT-OSS Models */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">GPT-OSS 시리즈</h4>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">2024년</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    오픈소스 GPT 모델로, GPT-3.5와 유사한 성능을 제공합니다.
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">모델:</span> GPT-OSS:20B, GPT-OSS:120B
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> 오픈소스, 로컬 실행, 커스터마이징 가능
                  </div>
                </div>

                {/* Gemma Models */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Gemma 시리즈</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">2024년 2월</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Google DeepMind에서 개발한 경량화된 오픈소스 언어 모델입니다.
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">모델:</span> Gemma3:12B, Gemma2:9B, Gemma2:2B
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> Google 개발, 경량화, 안전성 중시
                  </div>
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

                {/* Qwen Models */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Qwen 시리즈</h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">2023년</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Alibaba Cloud에서 개발한 다국어 지원 언어 모델입니다.
                  </p>
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">모델:</span> Qwen3:14B, Qwen2.5:14B, Qwen2:72B
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">특징:</span> Alibaba 개발, 다국어 지원, 강력한 성능
                  </div>
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

          {/* Model Comparison Table */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">모델 비교표</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">모델</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">개발사</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">출시일</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">특징</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">용도</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-3 font-medium">GPT-4o</td>
                    <td className="py-2 px-3">OpenAI</td>
                    <td className="py-2 px-3">2024년 5월</td>
                    <td className="py-2 px-3">멀티모달, 최고 성능</td>
                    <td className="py-2 px-3">복잡한 분석, 창의적 작업</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">GPT-3.5 Turbo</td>
                    <td className="py-2 px-3">OpenAI</td>
                    <td className="py-2 px-3">2022년 11월</td>
                    <td className="py-2 px-3">빠른 응답, 비용 효율</td>
                    <td className="py-2 px-3">일반 대화, 간단한 작업</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Llama3.3</td>
                    <td className="py-2 px-3">Meta</td>
                    <td className="py-2 px-3">2023년</td>
                    <td className="py-2 px-3">오픈소스, 커스터마이징</td>
                    <td className="py-2 px-3">로컬 배포, 특화 모델</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Gemma3:12B</td>
                    <td className="py-2 px-3">Google</td>
                    <td className="py-2 px-3">2024년 2월</td>
                    <td className="py-2 px-3">안전성, 경량화</td>
                    <td className="py-2 px-3">교육, 연구, 안전한 AI</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Qwen3:14B</td>
                    <td className="py-2 px-3">Alibaba</td>
                    <td className="py-2 px-3">2023년</td>
                    <td className="py-2 px-3">다국어 지원, 강력한 성능</td>
                    <td className="py-2 px-3">국제 비즈니스, 다국어 서비스</td>
                  </tr>
                </tbody>
              </table>
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
