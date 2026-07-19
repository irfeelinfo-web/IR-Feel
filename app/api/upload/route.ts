import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { isAuthenticated } from "@/lib/admin-auth"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
])

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"])

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WebP, AVIF, GIF, SVG) আপলোড করা যাবে।" },
        { status: 400 },
      )
    }

    // Validate file extension
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "অনুমোদিত ফাইল ফরম্যাট নয়।" },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "ফাইলের সাইজ ৫ MB-এর বেশি হতে পারবে না।" },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check for Vercel/serverless environment
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "Local file uploads are not supported on Vercel. Please configure cloud storage (e.g., AWS S3, Vercel Blob)." },
        { status: 501 }
      )
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "-")
    const filename = `${base}-${uniqueSuffix}${ext}`

    // Write file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return the URL
    return NextResponse.json({ url: `/images/uploads/${filename}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
