import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: url });

async function main() {
  const client = await pool.connect();
  try {
    // Check if tables already exist before dropping them
    const { rows: existingTables } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('transactions', 'budgets', 'saving_goals')
    `);

    const tableNames = existingTables.map((r) => r.table_name);

    if (tableNames.length > 0) {
      console.log("\n ⚠️  The following tables already exist and will be preserved:");
      tableNames.forEach((name) => console.log(`    - ${name}`));
      console.log("\n If you want to reset the schema, please confirm you've backed up your data.\n");
    } else {
      console.log("✅  No existing tables found — creating fresh tables");
    }

    // Only create tables that don't exist
    if (!tableNames.includes("transactions")) {
      await client.query(`
        CREATE TABLE transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          amount NUMERIC(12,2) NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          note TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log("✅ transactions table created");
    } else {
      console.log("⏭️  transactions table already exists, skipping");
    }

    if (!tableNames.includes("budgets")) {
      await client.query(`
        CREATE TABLE budgets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          category TEXT NOT NULL UNIQUE,
          limit_amount NUMERIC(12,2) NOT NULL,
          spent NUMERIC(12,2) NOT NULL DEFAULT 0,
          color TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log("✅ budgets table created");
    } else {
      console.log("⏭️  budgets table already exists, skipping");
    }

    if (!tableNames.includes("saving_goals")) {
      await client.query(`
        CREATE TABLE saving_goals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          target_amount NUMERIC(12,2) NOT NULL,
          saved_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
          deadline TIMESTAMPTZ NOT NULL,
          emoji TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log("✅ saving_goals table created");
    } else {
      console.log("⏭️  saving_goals table already exists, skipping");
    }

    // Seed default budgets
    await client.query(`
      INSERT INTO budgets (category, limit_amount, spent, color) VALUES
        ('food', 300, 0, '#F97316'),
        ('transport', 100, 0, '#8B5CF6'),
        ('entertainment', 80, 0, '#EC4899'),
        ('education', 200, 0, '#2563EB'),
        ('shopping', 150, 0, '#0EA5E9')
      ON CONFLICT (category) DO NOTHING;
    `);
    console.log("✅ Default budgets seeded");

    console.log("\n🎉 All tables created and seeded successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
