import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { neo4jDataService } from "@/services/neo4j.service"

export async function GET(req) {
  const ck = await cookies()
  if (ck.get("administrator_auth")?.value !== "ok") {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 })
  }
  const url = new URL(req.url)
  const student = url.searchParams.get("student")
  if (!student) return NextResponse.json({ msg: "student required" }, { status: 400 })

  try {
    const data = await neo4jDataService.getDailyAndWeeklyForStudent(student)
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ msg: "query failed" }, { status: 500 })
  }
}

