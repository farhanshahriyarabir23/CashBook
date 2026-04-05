import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { budgetsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/budgets - List all budgets
router.get("/", async (_req, res) => {
  try {
    const budgets = await db.select().from(budgetsTable);

    const formatted = budgets.map((b) => ({
      id: b.id,
      category: b.category,
      limit: Number(b.limitAmount),
      spent: Number(b.spent),
      color: b.color,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// POST /api/budgets - Create a new budget
router.post("/", async (req, res) => {
  try {
    const { category, limit, spent, color } = req.body;

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      res.status(400).json({ error: "category is required and must be a non-empty string." });
      return;
    }

    const parsedLimit = Number(limit);
    if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
      res.status(400).json({ error: "Invalid limit. Must be a non-negative number." });
      return;
    }

    const parsedSpent = spent !== undefined ? Number(spent) : 0;
    if (!Number.isFinite(parsedSpent) || parsedSpent < 0) {
      res.status(400).json({ error: "Invalid spent. Must be a non-negative number." });
      return;
    }

    if (!color || typeof color !== "string" || color.trim().length === 0) {
      res.status(400).json({ error: "color is required and must be a non-empty string." });
      return;
    }

    const [budget] = await db
      .insert(budgetsTable)
      .values({
        category,
        limitAmount: String(parsedLimit),
        spent: String(parsedSpent),
        color,
      })
      .returning();

    res.status(201).json({
      id: budget.id,
      category: budget.category,
      limit: Number(budget.limitAmount),
      spent: Number(budget.spent),
      color: budget.color,
    });
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({ error: "Failed to create budget" });
  }
});

// PUT /api/budgets/:id - Update a budget's spent amount
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { spent } = req.body;

    const [budget] = await db
      .update(budgetsTable)
      .set({ spent: String(spent), updatedAt: new Date() })
      .where(eq(budgetsTable.id, id))
      .returning();

    if (!budget) {
      res.status(404).json({ error: "Budget not found" });
      return;
    }

    res.json({
      id: budget.id,
      category: budget.category,
      limit: Number(budget.limitAmount),
      spent: Number(budget.spent),
      color: budget.color,
    });
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

export default router;
