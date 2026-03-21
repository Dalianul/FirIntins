export async function POST(request: Request) {
  // No-op: validates email format (client-side), returns 200
  // Real storage wired in Faza 3
  return Response.json({ success: true })
}
