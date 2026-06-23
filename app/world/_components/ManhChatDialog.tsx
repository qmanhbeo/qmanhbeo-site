"use client"

import { MessageCircle, X } from "lucide-react"
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
  chatInteractRef: React.MutableRefObject<(() => void) | null>
}

const MAX_HISTORY = 20

export default function ManhChatDialog({ bottomBand, onClose, chatInteractRef }: ManhChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Go on, ask me anything. Or just wander — the hearth doesn't mind." },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [chatFocus, setChatFocus] = useState<"input" | "close">("input")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInteract = useCallback(() => {
    if (chatFocus === "input") {
      inputRef.current?.focus()
    } else {
      onClose()
    }
  }, [chatFocus, onClose])

  chatInteractRef.current = handleInteract

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
          const act = action
          if (act.type === "moveTo") {
            const location = act.payload.location as string
            if (location) {
              gameBridge.emit("manh-chat-move-to", { locationId: location })
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "...Forgive me. The words caught in the wind. Try again?" },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  // Input key handler: stopPropagation + Enter sends + blurs
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (e.key === "Enter") {
        e.preventDefault()
        sendMessage()
        e.currentTarget.blur()
      }
    },
    [sendMessage],
  )

  // Window keydown: navigation when not typing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isTyping) return

      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        e.preventDefault()
        if (chatFocus === "close") {
          setChatFocus("input")
        } else {
          messagesAreaRef.current?.scrollBy({ top: -100, behavior: "smooth" })
        }
      } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
        e.preventDefault()
        if (chatFocus === "input") {
          setChatFocus("close")
        }
      } else if (e.key === "e" || e.key === "E" || e.key === "Enter") {
        e.preventDefault()
        if (chatFocus === "input") {
          inputRef.current?.focus()
        } else {
          onClose()
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [chatFocus, isTyping, onClose])

  // GameBridge chat-navigate (joystick Y direction)
  useEffect(() => {
    const off = gameBridge.on("chat-navigate", ({ direction }) => {
      if (isTyping) return
      if (direction === "up") {
        if (chatFocus === "close") {
          setChatFocus("input")
        } else {
          messagesAreaRef.current?.scrollBy({ top: -100, behavior: "smooth" })
        }
      } else {
        if (chatFocus === "input") {
          setChatFocus("close")
        }
      }
    })
    return off
  }, [chatFocus, isTyping])

  // Focus/blur → typing state + GameBridge event
  const handleInputFocus = useCallback(() => {
    setIsTyping(true)
    gameBridge.emit("chat-keyboard-state", { active: true })
  }, [])

  const handleInputBlur = useCallback(() => {
    setIsTyping(false)
    gameBridge.emit("chat-keyboard-state", { active: false })
  }, [])

  const bottomPad = isTyping ? 16 : 24
  const topPad = 80

  return (
    <div
      className="fixed z-40 flex flex-col px-4"
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
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              chatFocus === "close"
                ? "ring-1 ring-amber-400/60 text-amber-200 bg-amber-400/10"
                : "text-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-5 py-3 scrollbar-fade min-h-0">
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

        <div className={`shrink-0 flex items-center gap-2 border-t border-amber-400/12 px-5 py-3 ${
          chatFocus === "input" ? "ring-1 ring-amber-400/60 rounded-b-[1.8rem]" : ""
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Speak your mind..."
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-lg border border-amber-400/18 bg-amber-950/30 px-4 py-2 font-garamond text-base text-amber-50 placeholder-amber-400/30 outline-none transition-colors focus:border-amber-400/40 disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  )
}
