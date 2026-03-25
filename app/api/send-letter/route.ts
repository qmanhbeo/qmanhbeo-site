import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { name, email, message } = await req.json()

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.LETTER_TO_EMAIL!,
      subject: `Letter from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to send letter' }, { status: 500 })
  }
}
