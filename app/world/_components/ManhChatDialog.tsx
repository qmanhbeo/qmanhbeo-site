"use client"

import { BookOpen, MessageCircle, Send, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { OverlayLayoutMetrics } from "@/app/world/_hooks/useWorldOverlayLayout"
import { useWorld, type ChatMessage } from "@/context/WorldContext"
import { getEntryBySlug } from "@/content/entries"

interface ChatAction {
  type: string
  payload: Record<string, unknown>
}

interface ManhChatResponse {
  reply: string
  actions: ChatAction[]
}

interface ManhChatDialogProps {
  bottomBand?: OverlayLayoutMetrics["bottomBand"]
  onClose: () => void
  onPendingMoveTo?: (location: string | null) => void
  onShowEntry?: (slug: string) => void
}

function getEntryLabel(slug: string): string {
  const entry = getEntryBySlug(slug)
  if (!entry) return "See entry"
  switch (entry.type) {
    case "publication": return "See scroll"
    case "project": return "See project"
    case "note": return "See note"
    case "arc": return "See scroll"
  }
}

const MAX_HISTORY = 20

export default function ManhChatDialog({ bottomBand, onClose, onPendingMoveTo, onShowEntry }: ManhChatDialogProps) {
  const { chatMessages, setChatMessages } = useWorld()
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    chatMessages.length > 0
      ? chatMessages
      : [{ role: "assistant", content: "Go on, ask me anything. Or just wander — the hearth doesn't mind." }],
  )

  useEffect(() => {
    setChatMessages(messages)
  }, [messages, setChatMessages])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const onResize = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      setIsKeyboardOpen(vh < window.innerHeight * 0.75)
    }
    onResize()
    window.visualViewport?.addEventListener("resize", onResize)
    window.addEventListener("resize", onResize)
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  const executeSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setIsLoading(true)

    try {
      const chatHistory = messages
        .slice(-MAX_HISTORY)
        .filter((m) => m.role !== "emote")
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/manh/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatHistory, { role: "user", content: text }] }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const data: ManhChatResponse = await res.json()

      if (data.reply) {
        const newMessage: ChatMessage = { role: "assistant", content: data.reply }
        if (data.actions && data.actions.length > 0) {
          const showEntryAction = data.actions.find((a) => a.type === "showEntry")
          if (showEntryAction) {
            const slug = showEntryAction.payload.slug as string
            if (slug) {
              newMessage.showEntry = { slug, label: getEntryLabel(slug) }
            }
          }
        }
        setMessages((prev) => [...prev, newMessage])
      }

      let pendingMoveTo: string | null = null
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          if (action.type === "moveTo") {
            const location = action.payload.location as string
            if (location) pendingMoveTo = location
          }
        }
      }
      onPendingMoveTo?.(pendingMoveTo)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "...Forgive me. The words caught in the wind. Try again?" },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === "Enter" && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  const bottomPad = isKeyboardOpen ? 16 : 24
  const topPad = 80

  return (
    <div
      className="pointer-events-auto fixed z-40 flex flex-col px-4"
      style={{ left: 0, right: 0, bottom: `${bottomPad}px`, top: `${topPad}px` }}
    >
      <div className="flex w-full max-w-3xl flex-col self-center overflow-hidden rounded-[1.8rem] border border-amber-400/18 bg-[#120a08]/92 shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-sm">
        <div className="shrink-0 flex items-center justify-between border-b border-amber-400/12 px-5 py-3">
          <div className="flex items-center gap-2 text-amber-100">
            <MessageCircle className="h-4 w-4" />
            <span className="font-cinzel text-sm uppercase tracking-[0.24em]">Chat with Manh</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-amber-400/60 transition-colors hover:bg-amber-400/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-fade min-h-0">
          {messages.map((msg, i) => {
            if (msg.role === "emote") {
              return (
                <p key={i} className="py-1 text-center font-garamond text-sm italic text-amber-300/50">
                  {msg.content}
                </p>
              )
            }
            const isUser = msg.role === "user"
            return (
              <div key={i} className={`mb-3 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 font-garamond text-base leading-7 ${
                    isUser
                      ? "bg-amber-700/30 text-amber-100"
                      : "bg-amber-950/40 text-amber-50/92"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.showEntry && (
                  <button
                    onClick={() => onShowEntry?.(msg.showEntry!.slug)}
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-950/60 px-3.5 py-1 font-cinzel text-[0.7rem] uppercase tracking-[0.18em] text-amber-300/80 transition-all hover:border-amber-400/40 hover:text-amber-200"
                  >
                    <BookOpen className="h-3 w-3" />
                    {msg.showEntry.label}
                  </button>
                )}
              </div>
            )
          })}
          {isLoading && (
            <div className="mb-3 flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-amber-950/40 px-4 py-2 font-garamond text-base leading-7 text-amber-50/60">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 flex items-center gap-2 border-t border-amber-400/12 px-5 py-3 rounded-b-[1.8rem]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") {
                e.preventDefault()
                executeSend()
              }
            }}
            placeholder="Speak your mind..."
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-lg border border-amber-400/18 bg-amber-950/30 px-4 py-2 font-garamond text-base text-amber-50 placeholder-amber-400/30 outline-none transition-colors focus:border-amber-400/40 disabled:opacity-40"
          />
          <button
            onClick={() => executeSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-700/30 text-amber-200 transition-colors hover:bg-amber-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
