export const dynamic = "force-dynamic"

export async function POST(request: Request) {
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
      return Response.json(
        { error: "Invalid payload: messages array required" },
        { status: 400 },
      )
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
        console.error("[paths-untold/chat] OpenAI error", upstreamRes.status, text.slice(0, 400))
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
