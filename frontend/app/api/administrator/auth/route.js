import { NextResponse } from "next/server"

export async function POST(req) {
  const { key } = await req.json()
  if (key !== "2by2") return NextResponse.json({ ok: false }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.headers.set(
    "Set-Cookie",
    `administrator_auth=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}`
  )
  return res
}

