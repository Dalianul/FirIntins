import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl
  const path = searchParams.get("path") ?? "/"

  const dm = await draftMode()
  dm.disable()

  redirect(path)
}
