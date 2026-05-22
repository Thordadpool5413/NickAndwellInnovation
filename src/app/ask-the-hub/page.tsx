"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react"
import type { Message } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const sampleQuestions = [
  { text: "How does Andwell compare to Northern Light in Maine?", category: "Competitive" },
  { text: "Which Maine counties have the most unserved home health need?", category: "Growth" },
  { text: "What is Amedisys doing in Maine?", category: "Intelligence" },
  { text: "Who has the highest market share in Maine?", category: "Competitive" },
  { text: "What are the top expansion opportunities for Andwell?", category: "Strategy" },
]

const categoryColors: Record<string, string> = {
  Competitive: "border-brand-500/30 text-brand-300 hover:border-brand-500",
  Growth: "border-green-500/30 text-green-300 hover:border-green-500",
  Intelligence: "border-amber-500/30 text-amber-300 hover:border-amber-500",
  Strategy: "border-purple-500/30 text-purple-300 hover:border-purple-500",
}

export default function AskTheHubPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (question?: string) => {
    const q = question || input
    if (!q.trim() || loading) return
    const userMsg: Message = { role: "user", content: q }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I could not process that request. Please try again." },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Ask the Hub</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          AI-powered competitive intelligence for the Maine market
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/15 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-brand-400" />
            </div>
            <p className="text-surface-300 font-medium mb-1 text-lg">Ask about Maine&apos;s home health market</p>
            <p className="text-surface-500 text-sm mb-8">
              AI-powered insights on competitors, counties, and growth strategy
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q.text)}
                  className={`text-xs px-3.5 py-2 rounded-xl border bg-surface-900/50 hover:bg-surface-800 transition-all duration-200 text-left ${categoryColors[q.category] || ""}`}
                >
                  <Sparkles className="w-3 h-3 inline mr-1.5 text-brand-400" />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-br-md"
                  : "bg-surface-800 text-surface-200 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
              <span className="text-sm text-surface-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 shrink-0">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about competitors, Maine counties, or growth strategy..."
            icon={<MessageSquare className="w-4 h-4 text-surface-500" />}
          />
        </div>
        <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} icon={<Send className="w-4 h-4" />}>
          Send
        </Button>
      </div>
    </div>
  )
}
