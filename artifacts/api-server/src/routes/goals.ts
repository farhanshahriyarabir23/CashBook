import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { savingGoalsTable, insertSavingGoalSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/goals - List all saving goals
router.get("/", async (_req, res) => {
  try {
    const goals = await db.select().from(savingGoalsTable);

    const formatted = goals.map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: Number(g.targetAmount),
      savedAmount: Number(g.savedAmount),
      deadline: g.deadline.toISOString(),
      emoji: g.emoji,
      color: g.color,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/goals - Create a new saving goal
router.post("/", async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline, emoji, color } = req.body;

    const parsedDate = new Date(deadline);
    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }

    // Validate input
    const parsed = insertSavingGoalSchema.safeParse({
      title,
      targetAmount: String(targetAmount),
      savedAmount: String(savedAmount || 0),
      deadline: parsedDate,
      emoji,
      color,
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const [goal] = await db
      .insert(savingGoalsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json({
      id: goal.id,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      savedAmount: Number(goal.savedAmount),
      deadline: goal.deadline.toISOString(),
      emoji: goal.emoji,
      color: goal.color,
    });
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PUT /api/goals/:id - Update a goal
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, savedAmount, deadline, emoji, color } = req.body;

    // Build update set from provided fields
    const updateSet: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateSet.title = title;
    if (targetAmount !== undefined) updateSet.targetAmount = String(targetAmount);
    if (savedAmount !== undefined) updateSet.savedAmount = String(savedAmount);
    if (deadline !== undefined) {
      const parsedDeadline = new Date(deadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        res.status(400).json({ error: "Invalid date format." });
        return;
      }
      updateSet.deadline = parsedDeadline;
    }
    if (emoji !== undefined) updateSet.emoji = emoji;
    if (color !== undefined) updateSet.color = color;

    const [goal] = await db
      .update(savingGoalsTable)
      .set(updateSet)
      .where(eq(savingGoalsTable.id, id))
      .returning();

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    res.json({
      id: goal.id,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      savedAmount: Number(goal.savedAmount),
      deadline: goal.deadline.toISOString(),
      emoji: goal.emoji,
      color: goal.color,
    });
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE /api/goals/:id - Delete a saving goal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(savingGoalsTable).where(eq(savingGoalsTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
