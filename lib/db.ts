import "server-only"
import Database from "better-sqlite3"
import { join } from "path"
import { existsSync, readFileSync, renameSync } from "fs"
import { randomBytes } from "crypto"

/* ── SQLite database path ── */
const DB_PATH = join(process.cwd(), ".data", "store.db")

/** Generate a random order UID like "IRF-A7X3K9B2" — cryptographically random, hard to guess, easy to read. */
export function generateOrderUid(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I to avoid confusion
  const bytes = randomBytes(8)
  let code = ""
  for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length]
  return `IRF-${code.slice(0, 4)}${code.slice(4)}`
}

/* ── Singleton: one connection per process ── */
const globalForDb = globalThis as unknown as { __sqlite?: Database.Database }

function getDb(): Database.Database {
  if (globalForDb.__sqlite) return globalForDb.__sqlite

  const db = new Database(DB_PATH)

  // Performance pragmas for maximum speed & safety
  db.pragma("journal_mode = WAL")        // Write-Ahead Logging (concurrent reads while writing)
  db.pragma("synchronous = NORMAL")      // Good balance of speed and durability
  db.pragma("foreign_keys = ON")         // Enforce foreign key constraints
  db.pragma("busy_timeout = 5000")       // Wait up to 5s if DB is locked
  db.pragma("cache_size = -20000")       // 20MB cache

  // Create tables if they don't exist
  db.exec(`
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
      expires_at INTEGER NOT NULL
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
  `)

  // Migrate: add order_uid column if missing (existing DBs)
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN order_uid TEXT NOT NULL DEFAULT ''`)
  } catch { /* column already exists */ }

  // Migrate: add google_id, avatar columns to customers if missing
  try { db.exec(`ALTER TABLE customers ADD COLUMN google_id TEXT`) } catch { /* exists */ }
  try { db.exec(`ALTER TABLE customers ADD COLUMN avatar TEXT NOT NULL DEFAULT ''`) } catch { /* exists */ }
  try { db.exec(`ALTER TABLE customers ADD COLUMN reward_points INTEGER NOT NULL DEFAULT 0`) } catch { /* exists */ }

  // Migrate: create profile_change_requests table
  db.exec(`
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

  // Apply DB schema migrations for existing columns
  try {
    db.exec("ALTER TABLE customers ADD COLUMN password TEXT NOT NULL DEFAULT ''")
  } catch {
    // Column already exists, safe to ignore
  }

  try {
    db.exec("ALTER TABLE rate_limits ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 0")
  } catch {
    // Ignore
  }

  // Backfill empty order_uid values
  const emptyUids = db.prepare(`SELECT id FROM orders WHERE order_uid = ''`).all() as { id: number }[]
  if (emptyUids.length > 0) {
    const update = db.prepare(`UPDATE orders SET order_uid = ? WHERE id = ?`)
    const tx = db.transaction(() => {
      for (const row of emptyUids) {
        update.run(generateOrderUid(), row.id)
      }
    })
    tx()
  }

  // Migrate existing JSON data into SQLite (one-time)
  migrateJsonData(db)

  globalForDb.__sqlite = db

  // Ensure DB is closed properly when process exits (helps with Next.js hot reload locks)
  if (process.env.NODE_ENV !== "production") {
    process.on("SIGINT", () => {
      db.close()
      process.exit(0)
    })
    process.on("SIGTERM", () => {
      db.close()
      process.exit(0)
    })
  }

  return db
}

/* ── Migrate existing .data/*.json into SQLite ── */
function migrateJsonData(db: Database.Database) {
  const dataDir = join(process.cwd(), ".data")

  // Migrate site-content.json
  const contentFile = join(dataDir, "site-content.json")
  if (existsSync(contentFile)) {
    try {
      const raw = JSON.parse(readFileSync(contentFile, "utf-8"))
      const upsert = db.prepare(
        `INSERT INTO site_content (section, data) VALUES (?, ?)
         ON CONFLICT(section) DO UPDATE SET data = excluded.data`
      )
      const tx = db.transaction(() => {
        for (const [section, data] of Object.entries(raw)) {
          upsert.run(section, JSON.stringify(data))
        }
      })
      tx()
      renameSync(contentFile, contentFile + ".migrated")
    } catch (e) {
      console.error("Migration error site-content.json:", e)
    }
  }

  // Migrate products.json
  const productsFile = join(dataDir, "products.json")
  if (existsSync(productsFile)) {
    try {
      const products = JSON.parse(readFileSync(productsFile, "utf-8"))
      if (Array.isArray(products) && products.length > 0) {
        const upsert = db.prepare(
          `INSERT INTO products (id, name, price, old_price, image, badge, category, colors, sizes, description, images, rating, reviews, in_stock, featured, new_arrival, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, price=excluded.price, old_price=excluded.old_price,
             image=excluded.image, badge=excluded.badge, category=excluded.category,
             colors=excluded.colors, sizes=excluded.sizes, description=excluded.description,
             images=excluded.images, rating=excluded.rating, reviews=excluded.reviews,
             in_stock=excluded.in_stock, featured=excluded.featured,
             new_arrival=excluded.new_arrival, sort_order=excluded.sort_order`
        )
        const tx = db.transaction(() => {
          for (const p of products) {
            if (p._deleted) continue
            upsert.run(
              p.id, p.name, p.price, p.oldPrice ?? p.old_price ?? null,
              p.image, p.badge ?? null, p.category ?? null,
              JSON.stringify(p.colors ?? []), JSON.stringify(p.sizes ?? []),
              p.description ?? null, JSON.stringify(p.images ?? []),
              p.rating ?? 5, p.reviews ?? 0,
              (p.inStock ?? p.in_stock ?? 1) ? 1 : 0,
              (p.featured ?? 0) ? 1 : 0,
              (p.newArrival ?? p.new_arrival ?? 0) ? 1 : 0,
              p.sortOrder ?? p.sort_order ?? 0
            )
          }
        })
        tx()
      }
      renameSync(productsFile, productsFile + ".migrated")
    } catch (e) {
      console.error("Migration error products.json:", e)
    }
  }

  // Migrate orders.json
  const ordersFile = join(dataDir, "orders.json")
  if (existsSync(ordersFile)) {
    try {
      const orders = JSON.parse(readFileSync(ordersFile, "utf-8"))
      if (Array.isArray(orders) && orders.length > 0) {
        const existing = db.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }
        if (existing.c === 0) {
          const ins = db.prepare(
            `INSERT INTO orders (customer_name, phone, address, location, payment_method, transaction_id, items, subtotal, delivery_charge, total, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          const tx = db.transaction(() => {
            for (const o of orders) {
              ins.run(
                o.customer_name, o.phone, o.address, o.location ?? "",
                o.payment_method ?? "cod", o.transaction_id ?? null,
                JSON.stringify(o.items ?? []), o.subtotal ?? 0,
                o.delivery_charge ?? 0, o.total ?? 0,
                o.status ?? "pending", o.created_at ?? new Date().toISOString()
              )
            }
          })
          tx()
        }
      }
      renameSync(ordersFile, ordersFile + ".migrated")
    } catch (e) {
      console.error("Migration error orders.json:", e)
    }
  }

  // Migrate contacts.json
  const contactsFile = join(dataDir, "contacts.json")
  if (existsSync(contactsFile)) {
    try {
      const contacts = JSON.parse(readFileSync(contactsFile, "utf-8"))
      if (Array.isArray(contacts) && contacts.length > 0) {
        const existing = db.prepare("SELECT COUNT(*) as c FROM contacts").get() as { c: number }
        if (existing.c === 0) {
          const ins = db.prepare(
            `INSERT INTO contacts (name, phone, email, subject, message, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          const tx = db.transaction(() => {
            for (const c of contacts) {
              ins.run(c.name, c.phone ?? "", c.email ?? "", c.subject ?? "", c.message ?? "", c.created_at ?? new Date().toISOString())
            }
          })
          tx()
        }
      }
      renameSync(contactsFile, contactsFile + ".migrated")
    } catch (e) {
      console.error("Migration error contacts.json:", e)
    }
  }

  // Migrate newsletter.json
  const newsletterFile = join(dataDir, "newsletter.json")
  if (existsSync(newsletterFile)) {
    try {
      const subs = JSON.parse(readFileSync(newsletterFile, "utf-8"))
      if (Array.isArray(subs) && subs.length > 0) {
        const ins = db.prepare(
          `INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, ?)`
        )
        const tx = db.transaction(() => {
          for (const s of subs) {
            ins.run(s.email, s.subscribed_at ?? new Date().toISOString())
          }
        })
        tx()
      }
      renameSync(newsletterFile, newsletterFile + ".migrated")
    } catch (e) {
      console.error("Migration error newsletter.json:", e)
    }
  }
}

/* ── Exported DB instance ── */
export const db = getDb()

/* ── Helper: run a query and return rows (compatible with old API) ── */
export function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql)
  if (sql.trimStart().toUpperCase().startsWith("SELECT")) {
    return stmt.all(...params) as T[]
  }
  stmt.run(...params)
  return [] as T[]
}

/* ── Helper: run a query and return the change info ── */
export function run(sql: string, params: unknown[] = []): Database.RunResult {
  return db.prepare(sql).run(...params)
}

/* ── Helper: get a single row ── */
export function getOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined
}
