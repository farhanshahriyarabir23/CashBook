import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const ALLOWED_TYPES = ["income", "expense"] as const;

const router: IRouter = Router();

// GET /api/transactions - List all transactions
router.get("/", async (_req, res) => {
  try {
    const transactions = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.date));

    // Convert numeric strings to numbers for the mobile app
    const formatted = transactions.map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      date: t.date.toISOString(),
      note: t.note,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /api/transactions - Create a new transaction
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      res.status(400).json({ error: "Invalid amount. Must be a non-negative number." });
      return;
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "title is required and must be a non-empty string." });
      return;
    }

    if (!type || !ALLOWED_TYPES.includes(type)) {
      res.status(400).json({ error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` });
      return;
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      res.status(400).json({ error: "category is required and must be a non-empty string." });
      return;
    }

    if (date !== undefined && Number.isNaN(new Date(date).getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }

    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        title,
        amount: String(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        note: note || null,
      })
      .returning();

    res.status(201).json({
      id: transaction.id,
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.toISOString(),
      note: transaction.note,
    });
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
