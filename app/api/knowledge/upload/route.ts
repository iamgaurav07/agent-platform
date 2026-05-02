import { auth } from "@/lib/auth"
import { processAndStoreFile } from "@/lib/embeddings"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const agentId = formData.get("agentId") as string

    if (!file || !agentId) {
      return new Response("Missing file or agentId", { status: 400 })
    }

    const fileName = file.name
    const fileType = file.name.split(".").pop()?.toLowerCase()
    let content = ""

    if (fileType === "txt" || fileType === "md" || fileType === "csv") {
      content = await file.text()
    } else if (fileType === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer())
      const { extractText } = await import("unpdf")
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true })
      content = text
    } else {
      return new Response("Unsupported file type. Use PDF, CSV, TXT, or MD", { status: 400 })
    }

    if (!content.trim()) {
      return new Response("File is empty or could not be parsed", { status: 400 })
    }

    const result = await processAndStoreFile({
      agentId,
      userId: session.user.id,
      fileName,
      content,
    })

    return Response.json({
      success: true,
      chunks: result.chunks,
      fileName,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return new Response(`Failed to process file: ${error}`, { status: 500 })
  }
}