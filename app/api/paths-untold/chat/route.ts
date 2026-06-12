export const dynamic = "force-dynamic"

const RETRYABLE_CODES = new Set([429, 500, 502, 503, 504])
const RETRYABLE_BODY_MARKERS = ["UNAVAILABLE"]

function pickEnv(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n]
    if (v && v.trim()) return v.trim()
  }
  return undefined
}

// ── Cohere helpers ──

function buildCohereMessages(messages: { role: string; content: string }[]) {
  const systemMessages = messages.filter((m) => m.role === "system")
  const nonSystemMessages = messages.filter((m) => m.role !== "system")

  const msgs = nonSystemMessages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }))

  if (msgs.length === 0 && systemMessages.length > 0) {
    return [{ role: "user", content: systemMessages[0].content }]
  }

  const firstUserIdx = msgs.findIndex((c) => c.role === "user")
  if (firstUserIdx !== -1 && systemMessages.length > 0) {
    const systemPrompt = systemMessages.map((m) => m.content).join("\n\n")
    msgs[firstUserIdx] = {
      role: "user",
      content: systemPrompt + "\n\n" + msgs[firstUserIdx].content,
    }
  }

  return msgs
}

function extractCohereContent(data: any): string {
  const content = data?.message?.content
  if (Array.isArray(content)) {
    const textPart = content.find((c: any) => c.type === "text")
    return textPart?.text || ""
  }
  return typeof content === "string" ? content : ""
}

function normalizeToOpenAI(content: string) {
  return { choices: [{ message: { content }, finish_reason: "stop" as const }] }
}

// ── OpenAI handler ──

async function handleOpenAI(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { messages, model, isPlanner, isEvaluator } = body

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Server misconfigured: missing OPENAI_API_KEY" },
        { status: 500 },
      )
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid payload: messages array required" }, { status: 400 })
    }

    const maxTokens = isPlanner ? 4000 : isEvaluator ? 800 : 1600
    const timeout = isPlanner ? 90000 : isEvaluator ? 20000 : 60000

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const upstreamRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages,
          max_completion_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!upstreamRes.ok) {
        const text = await upstreamRes.text().catch(() => "")
        console.error("[paths-untold/chat] OpenAI error", upstreamRes.status)
        return Response.json(
          { error: "Upstream error", status: upstreamRes.status },
          { status: upstreamRes.status },
        )
      }

      const data = await upstreamRes.json()
      return Response.json(data)
    } catch (err) {
      clearTimeout(timer)
      const msg = String(err || "")
      const isAbort = msg.includes("AbortError") || msg.includes("The operation was aborted")
      return Response.json(
        { error: isAbort ? "Upstream timeout" : "Proxy failed", message: msg },
        { status: isAbort ? 504 : 500 },
      )
    }
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

// ── Cohere handler ──

async function handleCohere(request: Request): Promise<Response> {
  const apiKey = pickEnv("COHERE_API", "COHERE_API_KEY")
  if (!apiKey) {
    return Response.json(
      { error: "Server misconfigured: missing COHERE_API or COHERE_API_KEY" },
      { status: 500 },
    )
  }

  const primaryModel = pickEnv("COHERE_MODEL") || "command-a-03-2025"
  const fallbacksRaw = pickEnv("COHERE_MODEL_FALLBACKS") || "command-r-plus-08-2024"
  const fallbacks = fallbacksRaw.split(",").map((s) => s.trim()).filter(Boolean)
  const lastResortsRaw = pickEnv("COHERE_MODEL_LAST_RESORTS") || ""
  const lastResorts = lastResortsRaw.split(",").map((s) => s.trim()).filter(Boolean)
  const allModels = [primaryModel, ...fallbacks, ...lastResorts]
  const enableFallback =
    pickEnv("ENABLE_PROVIDER_FALLBACK") === "true" && !!process.env.OPENAI_API_KEY

  const defaultMaxTokens = Number(pickEnv("COHERE_MAX_TOKENS") || 1600)
  const defaultTimeout = Number(pickEnv("COHERE_TIMEOUT") || 30000)

  try {
    const body = await request.json()
    const { messages, isPlanner, isEvaluator } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid payload: messages array required" }, { status: 400 })
    }

    const effectiveMaxTokens = isPlanner ? 4000 : defaultMaxTokens
    const effectiveTimeout = isPlanner ? 90000 : isEvaluator ? 15000 : defaultTimeout

    let lastError: { message: string; model: string } | null = null

    for (let attempt = 0; attempt < allModels.length; attempt++) {
      const currentModel = allModels[attempt]
      const isLastResort = attempt >= fallbacks.length + 1
      const attemptTimeout = isLastResort ? 60000 : effectiveTimeout

      const cohereMessages = buildCohereMessages(messages)
      const isReasoningModel =
        currentModel.includes("reasoning") || currentModel.includes("r7b")

      const cohereBody: Record<string, unknown> = {
        model: currentModel,
        messages: cohereMessages,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: effectiveMaxTokens,
      }

      if (isReasoningModel) {
        cohereBody.thinking = { type: "disabled" }
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), attemptTimeout)

      try {
        const upstreamRes = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cohereBody),
          signal: controller.signal,
        })

        clearTimeout(timer)

        if (!upstreamRes.ok) {
          const status = upstreamRes.status
          const text = await upstreamRes.text().catch(() => "")
          const canRetry =
            RETRYABLE_CODES.has(status) ||
            RETRYABLE_BODY_MARKERS.some((m) => text.includes(m))

          console.error(
            `[paths-untold/chat] Cohere error ${status} ${currentModel} attempt ${attempt + 1}/${allModels.length}`,
          )

          if (canRetry && attempt < allModels.length - 1) {
            continue
          }

          return Response.json(
            { error: `Cohere upstream error`, status },
            { status },
          )
        }

        const data = await upstreamRes.json()
        const content = extractCohereContent(data)

        if (!content) {
          console.error(`[paths-untold/chat] Cohere no content for ${currentModel}`)
          if (attempt < allModels.length - 1) continue
          return Response.json({ error: "No content in Cohere response" }, { status: 500 })
        }

        return Response.json(normalizeToOpenAI(content))
      } catch (err) {
        clearTimeout(timer)
        const errMsg = String(err || "")
        const isAbort =
          errMsg.includes("AbortError") || errMsg.includes("The operation was aborted")

        console.error(
          `[paths-untold/chat] Cohere error ${currentModel}: ${isAbort ? "timeout" : "error"}`,
        )

        if (attempt < allModels.length - 1) {
          continue
        }

        lastError = { message: isAbort ? "timeout" : errMsg.slice(0, 200), model: currentModel }
        break
      }
    }

    // Cohere → OpenAI fallback when enabled
    if (lastError && enableFallback) {
      console.log("[paths-untold/chat] Cohere failed, falling back to OpenAI")
      return handleOpenAI(request)
    }

    return Response.json(
      {
        error: "All Cohere models failed",
        message: lastError?.message || "Unknown error",
      },
      { status: 500 },
    )
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

// ── POST handler ──

export async function POST(request: Request) {
  const provider = (process.env.LLM_PROVIDER || "cohere").toLowerCase()

  if (provider === "cohere") {
    return handleCohere(request)
  }

  if (provider === "openai") {
    return handleOpenAI(request)
  }

  return Response.json(
    { error: `Unknown LLM_PROVIDER: "${provider}". Supported: cohere, openai` },
    { status: 400 },
  )
}
