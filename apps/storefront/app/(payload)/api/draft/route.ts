import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")
  const path = searchParams.get("path") ?? "/"

  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()

  redirect(path)
}
