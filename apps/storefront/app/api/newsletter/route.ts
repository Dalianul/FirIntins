import { getPayload } from "payload"
import config from "@payload-config"
import sgMail from "@sendgrid/mail"

export async function POST(req: Request) {
  const body = await req.json()
  const { email } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email invalid" }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: "newsletter-subscribers",
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return Response.json({ success: true })
  }

  await payload.create({
    collection: "newsletter-subscribers",
    data: { email, subscribedAt: new Date().toISOString() },
  })

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `Bun venit — codul tău de reducere ${process.env.NEXT_PUBLIC_NEWSLETTER_DISCOUNT_CODE}`,
    text: [
      "Mulțumim că te-ai abonat!",
      "",
      `Codul tău de reducere: ${process.env.NEXT_PUBLIC_NEWSLETTER_DISCOUNT_CODE}`,
      "Reducere 10% la prima comandă.",
      "",
      "Folosește codul la finalizarea comenzii.",
      "",
      "Pescuit plăcut,",
      "Echipa FirIntins",
    ].join("\n"),
  })

  return Response.json({ success: true })
}
