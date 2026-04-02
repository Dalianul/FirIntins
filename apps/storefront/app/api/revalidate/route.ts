import { revalidateTag } from "next/cache"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const tag = request.nextUrl.searchParams.get("tag")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 })
  }

  if (!tag) {
    return Response.json({ error: "Missing tag" }, { status: 400 })
  }

  revalidateTag(tag, {})
  return Response.json({ revalidated: true, tag })
}
