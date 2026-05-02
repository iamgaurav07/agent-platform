import { auth } from "@/lib/auth"
import { db } from "@/db"
import { knowledgeBases, documents } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const agentId = req.nextUrl.searchParams.get("agentId")
  if (!agentId) return new Response("Missing agentId", { status: 400 })

  const kb = await db
    .select()
    .from(knowledgeBases)
    .where(eq(knowledgeBases.agentId, agentId))
    .limit(1)

  if (kb.length === 0) return Response.json({ files: [] })

  const files = await db
    .selectDistinct({ fileName: documents.fileName })
    .from(documents)
    .where(eq(documents.knowledgeBaseId, kb[0].id))

  return Response.json({ files: files.map((f) => f.fileName) })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  const agentId = req.nextUrl.searchParams.get("agentId")
  const fileName = req.nextUrl.searchParams.get("fileName")

  if (!agentId || !fileName) return new Response("Missing params", { status: 400 })

  const kb = await db
    .select()
    .from(knowledgeBases)
    .where(eq(knowledgeBases.agentId, agentId))
    .limit(1)

  if (kb.length === 0) return Response.json({ success: true })

  await db
    .delete(documents)
    .where(eq(documents.fileName, fileName))

  return Response.json({ success: true })
}