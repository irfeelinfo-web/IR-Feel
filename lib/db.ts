import "server-only"
import { createClient, type Client, type InStatement } from "@libsql/client"
import { existsSync, readFileSync, renameSync, mkdirSync } from "fs"
import { join } from "path"
import { randomBytes } from "crypto"

/* ── Turso / LibSQL client ── */
const globalForDb = globalThis as unknown as { __libsql?: Client; __dbReady?: boolean }

function getClient(): Client {
  if (globalForDb.__libsql) return globalForDb.__libsql

  const isProduction = !!process.env.TURSO_DATABASE_URL

  let client: Client

  if (isProduction) {
    // Production: connect to remote Turso database
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  } else {
    // Development: use local SQLite file
    const dataDir = join(process.cwd(), ".data")
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
    client = createClient({
      url: `file:${join(dataDir, "store.db")}`,
    })
  }

  globalForDb.__libsql = client
  return client
}

/** Generate a random order UID like "IRF-A7X3K9B2" */
export function generateOrderUid(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(8)
  let code = ""
  for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length]
  return `IRF-${code.slice(0, 4)}${code.slice(4)}`
}

/* ── Initialize database tables ── */
async function initDb(): Promise<void> {
  if (globalForDb.__dbReady) return
  const client = getClient()

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS site_content (
      section TEXT PRIMARY KEY,
      data    TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      price       REAL NOT NULL DEFAULT 0,
      old_price   REAL,
      image       TEXT NOT NULL DEFAULT '',
      badge       TEXT,
      category    TEXT,
      colors      TEXT NOT NULL DEFAULT '[]',
      sizes       TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      images      TEXT NOT NULL DEFAULT '[]',
      rating      REAL NOT NULL DEFAULT 5,
      reviews     INTEGER NOT NULL DEFAULT 0,
      in_stock    INTEGER NOT NULL DEFAULT 1,
      featured    INTEGER NOT NULL DEFAULT 0,
      new_arrival INTEGER NOT NULL DEFAULT 0,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      ip TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      expires_at INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      order_uid        TEXT NOT NULL DEFAULT '',
      customer_name    TEXT NOT NULL,
      phone            TEXT NOT NULL,
      address          TEXT NOT NULL,
      location         TEXT NOT NULL DEFAULT '',
      payment_method   TEXT NOT NULL DEFAULT 'cod',
      transaction_id   TEXT,
      items            TEXT NOT NULL DEFAULT '[]',
      subtotal         REAL NOT NULL DEFAULT 0,
      delivery_charge  REAL NOT NULL DEFAULT 0,
      total            REAL NOT NULL DEFAULT 0,
      status           TEXT NOT NULL DEFAULT 'pending',
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL DEFAULT '',
      email      TEXT NOT NULL DEFAULT '',
      subject    TEXT NOT NULL DEFAULT '',
      message    TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      email         TEXT PRIMARY KEY,
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id   TEXT NOT NULL,
      sender_name  TEXT NOT NULL DEFAULT 'ভিজিটর',
      sender_phone TEXT NOT NULL DEFAULT '',
      message      TEXT NOT NULL,
      is_admin     INTEGER NOT NULL DEFAULT 0,
      is_read      INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);

    CREATE TABLE IF NOT EXISTS customers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL UNIQUE,
      email       TEXT NOT NULL DEFAULT '',
      password    TEXT NOT NULL DEFAULT '',
      address     TEXT NOT NULL DEFAULT '',
      city        TEXT NOT NULL DEFAULT '',
      google_id   TEXT,
      avatar      TEXT NOT NULL DEFAULT '',
      reward_points INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customer_sessions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id  INTEGER NOT NULL,
      token        TEXT NOT NULL UNIQUE,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_customer_session_token ON customer_sessions(token);

    CREATE TABLE IF NOT EXISTS profile_change_requests (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id   INTEGER NOT NULL,
      field_type    TEXT NOT NULL CHECK(field_type IN ('phone', 'email')),
      current_value TEXT NOT NULL DEFAULT '',
      new_value     TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      admin_note    TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
  `)

  // Safe column migrations (ignore errors if columns exist)
  const safeMigrations = [
    "ALTER TABLE orders ADD COLUMN order_uid TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE customers ADD COLUMN google_id TEXT",
    "ALTER TABLE customers ADD COLUMN avatar TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE customers ADD COLUMN reward_points INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE customers ADD COLUMN password TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE rate_limits ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 0",
  ]
  for (const sql of safeMigrations) {
    try { await getClient().execute(sql) } catch { /* column exists */ }
  }

  // Backfill empty order_uid values
  const emptyUids = await query<{ id: number }>("SELECT id FROM orders WHERE order_uid = ''")
  for (const row of emptyUids) {
    await run("UPDATE orders SET order_uid = ? WHERE id = ?", [generateOrderUid(), row.id])
  }

  // Migrate existing JSON data into DB (one-time, local dev only)
  if (!process.env.TURSO_DATABASE_URL) {
    await migrateJsonData()
  }

  globalForDb.__dbReady = true
}

/* ── Migrate existing .data/*.json into DB ── */
async function migrateJsonData() {
  const dataDir = join(process.cwd(), ".data")

  // Migrate site-content.json
  const contentFile = join(dataDir, "site-content.json")
  if (existsSync(contentFile)) {
    try {
      const raw = JSON.parse(readFileSync(contentFile, "utf-8"))
      for (const [section, data] of Object.entries(raw)) {
        await run(
          `INSERT INTO site_content (section, data) VALUES (?, ?)
           ON CONFLICT(section) DO UPDATE SET data = excluded.data`,
          [section, JSON.stringify(data)]
        )
      }
      renameSync(contentFile, contentFile + ".migrated")
    } catch (e) { console.error("Migration error site-content.json:", e) }
  }

  // Migrate products.json
  const productsFile = join(dataDir, "products.json")
  if (existsSync(productsFile)) {
    try {
      const products = JSON.parse(readFileSync(productsFile, "utf-8"))
      if (Array.isArray(products)) {
        for (const p of products) {
          if (p._deleted) continue
          await run(
            `INSERT INTO products (id, name, price, old_price, image, badge, category, colors, sizes, description, images, rating, reviews, in_stock, featured, new_arrival, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               name=excluded.name, price=excluded.price, old_price=excluded.old_price,
               image=excluded.image, badge=excluded.badge, category=excluded.category,
               colors=excluded.colors, sizes=excluded.sizes, description=excluded.description,
               images=excluded.images, rating=excluded.rating, reviews=excluded.reviews,
               in_stock=excluded.in_stock, featured=excluded.featured,
               new_arrival=excluded.new_arrival, sort_order=excluded.sort_order`,
            [
              p.id, p.name, p.price, p.oldPrice ?? p.old_price ?? null,
              p.image, p.badge ?? null, p.category ?? null,
              JSON.stringify(p.colors ?? []), JSON.stringify(p.sizes ?? []),
              p.description ?? null, JSON.stringify(p.images ?? []),
              p.rating ?? 5, p.reviews ?? 0,
              (p.inStock ?? p.in_stock ?? 1) ? 1 : 0,
              (p.featured ?? 0) ? 1 : 0,
              (p.newArrival ?? p.new_arrival ?? 0) ? 1 : 0,
              p.sortOrder ?? p.sort_order ?? 0,
            ]
          )
        }
      }
      renameSync(productsFile, productsFile + ".migrated")
    } catch (e) { console.error("Migration error products.json:", e) }
  }

  // Migrate orders.json
  const ordersFile = join(dataDir, "orders.json")
  if (existsSync(ordersFile)) {
    try {
      const orders = JSON.parse(readFileSync(ordersFile, "utf-8"))
      if (Array.isArray(orders) && orders.length > 0) {
        const existing = await getOne<{ c: number }>("SELECT COUNT(*) as c FROM orders")
        if ((existing?.c ?? 0) === 0) {
          for (const o of orders) {
            await run(
              `INSERT INTO orders (customer_name, phone, address, location, payment_method, transaction_id, items, subtotal, delivery_charge, total, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                o.customer_name, o.phone, o.address, o.location ?? "",
                o.payment_method ?? "cod", o.transaction_id ?? null,
                JSON.stringify(o.items ?? []), o.subtotal ?? 0,
                o.delivery_charge ?? 0, o.total ?? 0,
                o.status ?? "pending", o.created_at ?? new Date().toISOString(),
              ]
            )
          }
        }
      }
      renameSync(ordersFile, ordersFile + ".migrated")
    } catch (e) { console.error("Migration error orders.json:", e) }
  }

  // Migrate contacts.json
  const contactsFile = join(dataDir, "contacts.json")
  if (existsSync(contactsFile)) {
    try {
      const contacts = JSON.parse(readFileSync(contactsFile, "utf-8"))
      if (Array.isArray(contacts) && contacts.length > 0) {
        const existing = await getOne<{ c: number }>("SELECT COUNT(*) as c FROM contacts")
        if ((existing?.c ?? 0) === 0) {
          for (const c of contacts) {
            await run(
              `INSERT INTO contacts (name, phone, email, subject, message, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [c.name, c.phone ?? "", c.email ?? "", c.subject ?? "", c.message ?? "", c.created_at ?? new Date().toISOString()]
            )
          }
        }
      }
      renameSync(contactsFile, contactsFile + ".migrated")
    } catch (e) { console.error("Migration error contacts.json:", e) }
  }

  // Migrate newsletter.json
  const newsletterFile = join(dataDir, "newsletter.json")
  if (existsSync(newsletterFile)) {
    try {
      const subs = JSON.parse(readFileSync(newsletterFile, "utf-8"))
      if (Array.isArray(subs) && subs.length > 0) {
        for (const s of subs) {
          await run(
            `INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, ?)`,
            [s.email, s.subscribed_at ?? new Date().toISOString()]
          )
        }
      }
      renameSync(newsletterFile, newsletterFile + ".migrated")
    } catch (e) { console.error("Migration error newsletter.json:", e) }
  }
}

/* ── Exported async helpers ── */

/** Run a SELECT query and return all matching rows */
export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  await initDb()
  const result = await getClient().execute({ sql, args: params as InStatement["args"] })
  return result.rows as unknown as T[]
}

/** Run an INSERT/UPDATE/DELETE and return affected info */
export async function run(sql: string, params: unknown[] = []): Promise<{ rowsAffected: number; lastInsertRowid: bigint | number }> {
  await initDb()
  const result = await getClient().execute({ sql, args: params as InStatement["args"] })
  return {
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid ?? 0,
  }
}

/** Run a SELECT query and return the first row only */
export async function getOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const rows = await query<T>(sql, params)
  return rows[0]
}
