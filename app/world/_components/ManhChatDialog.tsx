"use client"

import { MessageCircle, SendHorizonal, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { gameBridge } from "@/game/GameBridge"
import type { OverlayLayoutMetrics } from "@/app/world/_hooks/useWorldOverlayLayout"

interface ChatMessage {
  role: "user" | "assistant" | "emote"
  content: string
}

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
}

const MAX_HISTORY = 20

export default function ManhChatDialog({ bottomBand, onClose }: ManhChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Go on, ask me anything. Or just wander — the hearth doesn't mind." },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleAction = useCallback((action: ChatAction) => {
    switch (action.type) {
      case "moveTo": {
        const location = action.payload.location as string
        if (location) {
          gameBridge.emit("manh-chat-move-to", { locationId: location })
        }
        break
      }
    }
  }, [])

  const sendMessage = useCallback(async () => {
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
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      }

      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          handleAction(action)
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "...Forgive me. The words caught in the wind. Try again?" },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, messages, handleAction])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
      if (e.key === "Escape") {
        onClose()
      }
    },
    [sendMessage, onClose],
  )

  const [viewportHeight, setViewportHeight] = useState(800)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      setViewportHeight(vh)
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

  const bottomY = bottomBand?.start ?? 200
  const bottomOffset = isKeyboardOpen ? 16 : bottomY + 24
  const dialogMaxHeight = isKeyboardOpen
    ? Math.min(viewportHeight - 96, 400)
    : Math.min(bottomY - Math.max(60, bottomY - 360) - 24, 400)

  return (
    <div
      className="fixed z-40 flex justify-center px-4"
      style={{ left: 0, right: 0, bottom: `${bottomOffset}px` }}
    >
      <div className="flex w-full max-w-3xl flex-col rounded-[1.8rem] border border-amber-400/18 bg-[#120a08]/92 shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-sm"
        style={{ maxHeight: `${dialogMaxHeight}px` }}
      >
        <div className="flex items-center justify-between border-b border-amber-400/12 px-5 py-3">
          <div className="flex items-center gap-2 text-amber-100">
            <MessageCircle className="h-4 w-4" />
            <span className="font-cinzel text-sm uppercase tracking-[0.24em]">Chat with Manh</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-amber-400/60 transition-colors hover:bg-amber-400/10 hover:text-amber-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-fade">
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
              <div key={i} className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 font-garamond text-base leading-7 ${
                    isUser
                      ? "bg-amber-700/30 text-amber-100"
                      : "bg-amber-950/40 text-amber-50/92"
                  }`}
                >
                  {msg.content}
                </div>
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

        <div className="flex items-center gap-2 border-t border-amber-400/12 px-5 py-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak your mind..."
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-lg border border-amber-400/18 bg-amber-950/30 px-4 py-2 font-garamond text-base text-amber-50 placeholder-amber-400/30 outline-none transition-colors focus:border-amber-400/40 disabled:opacity-40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-amber-400/60 transition-colors hover:bg-amber-400/10 hover:text-amber-300 disabled:opacity-30"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
