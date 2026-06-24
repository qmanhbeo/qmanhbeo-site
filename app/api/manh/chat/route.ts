export const dynamic = "force-dynamic"

import { getAllEntries, getEntryPreviewText } from "@/content/entries"

const LOCATION_INDEX = [
  { id: "manh-guide-workshop", name: "Workshop", description: "where projects and prototypes live" },
  { id: "manh-guide-library", name: "Library", description: "research notes and publications" },
  { id: "manh-guide-yard", name: "Yard", description: "campfire notes and personal thoughts" },
  { id: "manh-guide-post", name: "Post", description: "where letters reach the real Manh" },
] as const

type Action = { type: string; payload: Record<string, unknown> }

const LOCATION_LIST = LOCATION_INDEX.map((l) => l.id).join(", ")

function buildKnowledgeIndex(): string {
  const entries = getAllEntries()
  const lines = entries.map((e) => {
    const preview = getEntryPreviewText(e).slice(0, 120)
    return `- [${e.type}] ${e.title} (${e.slug}): ${preview}`
  })
  return lines.join("\n")
}

function buildSystemPrompt(): string {
  return `You are Manh, the creator and inhabitant of this medieval pixel-art world. You are thoughtful, warm, and slightly poetic — a builder who turns half-baked ideas into real things and writes down what lingers.

Your world has these places you can show the visitor:
${LOCATION_INDEX.map((l) => `- ${l.name}: ${l.description}`).join("\n")}

You also have a collection of works and thoughts — projects you built, research you published, notes you wrote, journeys you took. Here is a summary of everything:

${buildKnowledgeIndex()}

When the visitor asks about your work, your research, your notes, or your travels, you can reference these entries naturally. You don't need to list everything — just speak from what you know.

You can also perform actions. Available actions:
- moveTo: Lead the visitor to a location. Payload: {"location": "<id>"}. Location ids: ${LOCATION_LIST}
- emote: Perform a subtle gesture or action shown as flavor text. Payload: {"text": "<description>"}
- showEntry: Offer the visitor a scroll from the archive to read. Payload: {"slug": "<entry-slug>"}. Use the slug from the knowledge index above.

When you perform an action, always also speak naturally about it. For example:
- moveTo → say "Follow me to the Workshop." and include {"type":"moveTo","payload":{"location":"manh-guide-workshop"}} in actions
- emote → say the gesture as part of your reply and include {"type":"emote","payload":{"text":"..."}} in actions
- showEntry → include {"type":"showEntry","payload":{"slug":"<slug>"}} in actions along with your spoken reply

Always return a JSON object with exactly these fields:
{
  "reply": "your spoken response (always include this, even when doing an action)",
  "actions": [] or [{"type":"...","payload":{...}}]
}

If no action is needed, set actions to an empty array [].

Keep replies concise — 1 to 3 sentences unless asked for depth. Speak like someone sitting by a fire, not a tour guide reciting a script.`
}

function parseCohereReply(data: any): { reply: string; actions: Action[] } {
  const content = data?.message?.content
  const raw = Array.isArray(content)
    ? content.find((c: any) => c.type === "text")?.text || ""
    : typeof content === "string" ? content : ""
  try {
    const parsed = JSON.parse(raw)
    return {
      reply: typeof parsed.reply === "string" ? parsed.reply : "",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    }
  } catch {
    return { reply: raw, actions: [] }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.COHERE_API || process.env.COHERE_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "Server misconfigured: missing COHERE_API or COHERE_API_KEY" },
      { status: 500 },
    )
  }

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid payload: messages array required" }, { status: 400 })
    }

    const model = process.env.COHERE_MANH_MODEL || "command-a-03-2025"

    const systemMsg = { role: "system", content: buildSystemPrompt() }
    const nonSystemMessages = messages.filter((m: any) => m.role !== "system")

    const firstUserIdx = nonSystemMessages.findIndex((m: any) => m.role === "user")
    if (firstUserIdx !== -1) {
      nonSystemMessages[firstUserIdx] = {
        role: "user",
        content: systemMsg.content + "\n\n" + nonSystemMessages[firstUserIdx].content,
      }
    }

    const cohereBody: Record<string, unknown> = {
      model,
      messages: nonSystemMessages,
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 600,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const upstreamRes = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cohereBody),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => "")
      console.error("[manh/chat] Cohere error", upstreamRes.status, text.slice(0, 200))
      return Response.json(
        { error: "Upstream error", status: upstreamRes.status },
        { status: upstreamRes.status },
      )
    }

    const data = await upstreamRes.json()
    const { reply, actions } = parseCohereReply(data)

    return Response.json({ reply, actions })
  } catch (err) {
    const msg = String(err || "")
    const isAbort = msg.includes("AbortError") || msg.includes("The operation was aborted")
    console.error("[manh/chat] Error", isAbort ? "timeout" : msg.slice(0, 200))
    return Response.json(
      { error: isAbort ? "Upstream timeout" : "Internal error" },
      { status: isAbort ? 504 : 500 },
    )
  }
}
