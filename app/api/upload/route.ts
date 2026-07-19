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

    // Production (Vercel): use imgBB cloud hosting (free)
    if (process.env.VERCEL) {
      const apiKey = process.env.IMGBB_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { error: "IMGBB_API_KEY সেট করা হয়নি। Vercel Environment Variables এ যোগ করুন।" },
          { status: 500 },
        )
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")

      // Upload to imgBB
      const imgbbForm = new FormData()
      imgbbForm.append("key", apiKey)
      imgbbForm.append("image", base64)
      imgbbForm.append("name", path.basename(file.name, ext))

      const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: imgbbForm,
      })

      if (!imgbbRes.ok) {
        console.error("imgBB upload failed:", await imgbbRes.text())
        return NextResponse.json(
          { error: "ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
          { status: 500 },
        )
      }

      const imgbbData = await imgbbRes.json()
      const imageUrl = imgbbData.data?.display_url || imgbbData.data?.url

      if (!imageUrl) {
        return NextResponse.json(
          { error: "ছবি আপলোড ব্যর্থ হয়েছে।" },
          { status: 500 },
        )
      }

      return NextResponse.json({ url: imageUrl })
    }

    // Local development: save to public/images/uploads
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "images", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "-")
    const filename = `${base}-${uniqueSuffix}${ext}`

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/images/uploads/${filename}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" }, { status: 500 })
  }
}
