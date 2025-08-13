"use client"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Copy
      </button>
      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
        {language && (
          <div className="text-xs text-gray-400 mb-2 font-mono">
            {language}
          </div>
        )}
        <code>{code}</code>
      </pre>
    </div>
  )
}
