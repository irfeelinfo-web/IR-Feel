// One-off setup: create tables and seed products for the fashion store.
// Run with: node scripts/seed.mjs
import { readFileSync } from "node:fs"
import pg from "pg"

// Load DATABASE_URL from the local env file if not already present.
function loadEnv() {
  if (process.env.DATABASE_URL) return
  for (const file of [".env.development.local", ".env.local", ".env"]) {
    try {
      const text = readFileSync(new URL("../" + file, import.meta.url), "utf8")
      for (const line of text.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
        if (!m) continue
        let [, k, v] = m
        v = v.replace(/^["']|["']$/g, "")
        if (!process.env[k]) process.env[k] = v
      }
      if (process.env.DATABASE_URL) return
    } catch {}
  }
}
loadEnv()

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const schema = `
CREATE TABLE IF NOT EXISTS products (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  price         numeric NOT NULL DEFAULT 0,
  old_price     numeric,
  image         text NOT NULL DEFAULT '',
  badge         text,
  category      text,
  colors        text[] NOT NULL DEFAULT '{}',
  sizes         text[] NOT NULL DEFAULT '{}',
  description   text,
  images        text[] NOT NULL DEFAULT '{}',
  rating        numeric NOT NULL DEFAULT 5,
  reviews       integer NOT NULL DEFAULT 0,
  in_stock      boolean NOT NULL DEFAULT true,
  featured      boolean NOT NULL DEFAULT false,
  new_arrival   boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
  section     text PRIMARY KEY,
  data        jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id               serial PRIMARY KEY,
  customer_name    text NOT NULL,
  phone            text NOT NULL,
  address          text NOT NULL,
  location         text NOT NULL DEFAULT '',
  payment_method   text NOT NULL DEFAULT 'cod',
  transaction_id   text,
  items            jsonb NOT NULL DEFAULT '[]',
  subtotal         numeric NOT NULL DEFAULT 0,
  delivery_charge  numeric NOT NULL DEFAULT 0,
  total            numeric NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS products_sort_idx ON products (sort_order ASC, created_at ASC);
`

const img = (n) => `/images/${n}.png`

const products = [
  {
    id: "premium-black-hoodie", name: "প্রিমিয়াম ব্ল্যাক হুডি", price: 1650, old_price: 2200,
    image: img("product-hoodie-black"), badge: "SALE", category: "Men",
    colors: ["Black", "Gray"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "নরম ফ্লিস কটন দিয়ে তৈরি প্রিমিয়াম হুডি — শীত ও ক্যাজুয়াল দুই সময়ের জন্য পারফেক্ট।",
    images: [img("product-hoodie-black"), img("hoodie-side"), img("hoodie-back"), img("hoodie-detail")],
    rating: 5, reviews: 128, featured: true, new_arrival: true, sort_order: 1,
  },
  {
    id: "olive-fleece-hoodie", name: "অলিভ ফ্লিস হুডি", price: 1750,
    image: img("product-hoodie-olive"), badge: "NEW", category: "Men",
    colors: ["Olive", "Black"], sizes: ["M", "L", "XL", "XXL"],
    description: "হেভিওয়েট ফ্লিস অলিভ হুডি, আরামদায়ক ফিট এবং টেকসই কাপড়।",
    images: [img("product-hoodie-olive")], rating: 5, reviews: 74, featured: true, new_arrival: true, sort_order: 2,
  },
  {
    id: "printed-graphic-hoodie", name: "প্রিন্টেড গ্রাফিক হুডি", price: 1850,
    image: img("product-printed-hoodie"), badge: "NEW", category: "Men",
    colors: ["Black", "Gray"], sizes: ["S", "M", "L", "XL"],
    description: "ট্রেন্ডি গ্রাফিক প্রিন্ট হুডি — স্টাইলিশ স্ট্রিটওয়্যার লুকের জন্য।",
    images: [img("product-printed-hoodie")], rating: 4.8, reviews: 51, featured: false, new_arrival: true, sort_order: 3,
  },
  {
    id: "classic-sweatshirt", name: "ক্লাসিক সোয়েটশার্ট", price: 1350,
    image: img("product-sweatshirt"), category: "Men",
    colors: ["Beige", "Gray"], sizes: ["S", "M", "L", "XL"],
    description: "মিনিমাল ক্লাসিক সোয়েটশার্ট, প্রতিদিনের ব্যবহারের জন্য আদর্শ।",
    images: [img("product-sweatshirt")], rating: 4.7, reviews: 39, featured: true, new_arrival: false, sort_order: 4,
  },
  {
    id: "bomber-jacket", name: "বোম্বার জ্যাকেট", price: 2650, old_price: 3200,
    image: img("product-bomber-jacket"), badge: "SALE", category: "Men",
    colors: ["Black", "Olive"], sizes: ["M", "L", "XL", "XXL"],
    description: "স্টাইলিশ বোম্বার জ্যাকেট — উইন্ডপ্রুফ এবং প্রিমিয়াম ফিনিশিং।",
    images: [img("product-bomber-jacket")], rating: 5, reviews: 88, featured: true, new_arrival: false, sort_order: 5,
  },
  {
    id: "denim-jacket", name: "ডেনিম জ্যাকেট", price: 2450,
    image: img("product-denim-jacket"), badge: "NEW", category: "Men",
    colors: ["Blue"], sizes: ["S", "M", "L", "XL"],
    description: "ক্লাসিক ডেনিম জ্যাকেট — সব সিজনে মানানসই টাইমলেস স্টাইল।",
    images: [img("product-denim-jacket")], rating: 4.9, reviews: 62, featured: false, new_arrival: true, sort_order: 6,
  },
  {
    id: "cargo-joggers", name: "কার্গো জগার্স", price: 1450,
    image: img("product-cargo-joggers"), category: "Men",
    colors: ["Black", "Olive", "Beige"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "আরামদায়ক কার্গো জগার্স — একাধিক পকেট ও স্ট্রেচি ফ্যাব্রিক।",
    images: [img("product-cargo-joggers")], rating: 4.8, reviews: 45, featured: true, new_arrival: false, sort_order: 7,
  },
  {
    id: "slim-fit-jeans", name: "স্লিম ফিট জিন্স", price: 1650,
    image: img("product-jeans"), category: "Men",
    colors: ["Blue", "Black"], sizes: ["S", "M", "L", "XL"],
    description: "প্রিমিয়াম স্লিম ফিট জিন্স — স্ট্রেচেবল ও টেকসই ডেনিম।",
    images: [img("product-jeans")], rating: 4.7, reviews: 71, featured: false, new_arrival: false, sort_order: 8,
  },
  {
    id: "classic-polo", name: "ক্লাসিক পোলো শার্ট", price: 950,
    image: img("product-polo"), category: "Men",
    colors: ["White", "Black", "Blue"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "প্রিমিয়াম কটন পোলো শার্ট — অফিস ও ক্যাজুয়াল উভয় লুকের জন্য।",
    images: [img("product-polo")], rating: 4.8, reviews: 96, featured: true, new_arrival: false, sort_order: 9,
  },
  {
    id: "striped-shirt", name: "স্ট্রাইপড শার্ট", price: 1150,
    image: img("product-striped-shirt"), badge: "NEW", category: "Men",
    colors: ["White", "Blue"], sizes: ["S", "M", "L", "XL"],
    description: "স্টাইলিশ স্ট্রাইপড শার্ট — হালকা ও শ্বাসপ্রশ্বাসযোগ্য কাপড়।",
    images: [img("product-striped-shirt")], rating: 4.6, reviews: 33, featured: false, new_arrival: true, sort_order: 10,
  },
  {
    id: "essential-tshirt", name: "এসেনশিয়াল টি-শার্ট", price: 650,
    image: img("product-tshirt"), category: "Men",
    colors: ["Black", "White", "Gray", "Olive"], sizes: ["S", "M", "L", "XL", "XXL"],
    description: "১০০% কটন এসেনশিয়াল টি-শার্ট — প্রতিদিনের আরামের জন্য।",
    images: [img("product-tshirt")], rating: 4.9, reviews: 210, featured: true, new_arrival: false, sort_order: 11,
  },
  {
    id: "classic-cap", name: "ক্লাসিক ক্যাপ", price: 450,
    image: img("product-cap"), category: "Accessories",
    colors: ["Black", "Beige"], sizes: [],
    description: "অ্যাডজাস্টেবল ক্লাসিক ক্যাপ — যেকোনো আউটফিটের সাথে মানানসই।",
    images: [img("product-cap")], rating: 4.7, reviews: 58, featured: false, new_arrival: true, sort_order: 12,
  },
]

async function main() {
  const client = await pool.connect()
  try {
    await client.query(schema)
    console.log("[seed] tables ready")
    for (const p of products) {
      await client.query(
        `INSERT INTO products
          (id,name,price,old_price,image,badge,category,colors,sizes,description,images,rating,reviews,in_stock,featured,new_arrival,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,$14,$15,$16)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, price=EXCLUDED.price, old_price=EXCLUDED.old_price, image=EXCLUDED.image,
           badge=EXCLUDED.badge, category=EXCLUDED.category, colors=EXCLUDED.colors, sizes=EXCLUDED.sizes,
           description=EXCLUDED.description, images=EXCLUDED.images, rating=EXCLUDED.rating, reviews=EXCLUDED.reviews,
           featured=EXCLUDED.featured, new_arrival=EXCLUDED.new_arrival, sort_order=EXCLUDED.sort_order`,
        [p.id, p.name, p.price, p.old_price ?? null, p.image, p.badge ?? null, p.category ?? null,
         p.colors, p.sizes, p.description ?? null, p.images, p.rating, p.reviews,
         p.featured, p.new_arrival, p.sort_order],
      )
    }
    const { rows } = await client.query("SELECT count(*)::int AS n FROM products")
    console.log("[seed] products in table:", rows[0].n)
  } finally {
    client.release()
    await pool.end()
  }
}

main().then(() => { console.log("[seed] done"); process.exit(0) })
  .catch((e) => { console.error("[seed] failed", e); process.exit(1) })