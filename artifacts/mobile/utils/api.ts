import { supabase } from "@/utils/supabase";

export type ApiTransaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string | null;
};

export type ApiBudget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
};

export type ApiSavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  emoji: string;
  color: string;
};

type TransactionRow = {
  id: string;
  title: string;
  amount: string | number;
  type: "income" | "expense";
  category: string;
  date: string;
  note: string | null;
};

type BudgetRow = {
  id: string;
  category: string;
  limit_amount: string | number;
  spent: string | number;
  color: string;
};

type SavingGoalRow = {
  id: string;
  title: string;
  target_amount: string | number;
  saved_amount: string | number;
  deadline: string;
  emoji: string;
  color: string;
};

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in to access finance data.");
  }

  return user.id;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapTransaction(row: TransactionRow): ApiTransaction {
  return {
    id: row.id,
    title: row.title,
    amount: toNumber(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    note: row.note,
  };
}

function mapBudget(row: BudgetRow): ApiBudget {
  return {
    id: row.id,
    category: row.category,
    limit: toNumber(row.limit_amount),
    spent: toNumber(row.spent),
    color: row.color,
  };
}

function mapSavingGoal(row: SavingGoalRow): ApiSavingGoal {
  return {
    id: row.id,
    title: row.title,
    targetAmount: toNumber(row.target_amount),
    savedAmount: toNumber(row.saved_amount),
    deadline: row.deadline,
    emoji: row.emoji,
    color: row.color,
  };
}

function requireData<T>(data: T | null, errorMessage: string): T {
  if (!data) {
    throw new Error(errorMessage);
  }

  return data;
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, title, amount, type, category, date, note")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapTransaction(row as TransactionRow));
}

export async function createTransaction(
  data: Omit<ApiTransaction, "id">
): Promise<ApiTransaction> {
  const userId = await getCurrentUserId();
  const { data: row, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      title: data.title,
      amount: String(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      note: data.note ?? null,
    })
    .select("id, title, amount, type, category, date, note")
    .single();

  if (error) {
    throw error;
  }

  return mapTransaction(requireData(row as TransactionRow | null, "Transaction was not returned after insert."));
}

export async function deleteTransaction(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function fetchBudgets(): Promise<ApiBudget[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("budgets")
    .select("id, category, limit_amount, spent, color")
    .eq("user_id", userId)
    .order("category", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapBudget(row as BudgetRow));
}

export async function createBudget(data: Omit<ApiBudget, "id">): Promise<ApiBudget> {
  const userId = await getCurrentUserId();
  const { data: row, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category: data.category,
      limit_amount: String(data.limit),
      spent: String(data.spent),
      color: data.color,
    })
    .select("id, category, limit_amount, spent, color")
    .single();

  if (error) {
    throw error;
  }

  return mapBudget(requireData(row as BudgetRow | null, "Budget was not returned after insert."));
}

export async function updateBudget(id: string, spent: number): Promise<ApiBudget> {
  const userId = await getCurrentUserId();
  const { data: row, error } = await supabase
    .from("budgets")
    .update({
      spent: String(spent),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, category, limit_amount, spent, color")
    .single();

  if (error) {
    throw error;
  }

  return mapBudget(requireData(row as BudgetRow | null, "Budget was not returned after update."));
}

export async function fetchGoals(): Promise<ApiSavingGoal[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("saving_goals")
    .select("id, title, target_amount, saved_amount, deadline, emoji, color")
    .eq("user_id", userId)
    .order("deadline", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapSavingGoal(row as SavingGoalRow));
}

export async function createGoal(
  data: Omit<ApiSavingGoal, "id">
): Promise<ApiSavingGoal> {
  const userId = await getCurrentUserId();
  const { data: row, error } = await supabase
    .from("saving_goals")
    .insert({
      user_id: userId,
      title: data.title,
      target_amount: String(data.targetAmount),
      saved_amount: String(data.savedAmount),
      deadline: data.deadline,
      emoji: data.emoji,
      color: data.color,
    })
    .select("id, title, target_amount, saved_amount, deadline, emoji, color")
    .single();

  if (error) {
    throw error;
  }

  return mapSavingGoal(requireData(row as SavingGoalRow | null, "Saving goal was not returned after insert."));
}

export async function updateGoalSavedAmount(
  id: string,
  savedAmount: number
): Promise<ApiSavingGoal> {
  return updateGoal(id, { savedAmount });
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<ApiSavingGoal, "id">>
): Promise<ApiSavingGoal> {
  const userId = await getCurrentUserId();
  const payload: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) payload.title = data.title;
  if (data.targetAmount !== undefined) payload.target_amount = String(data.targetAmount);
  if (data.savedAmount !== undefined) payload.saved_amount = String(data.savedAmount);
  if (data.deadline !== undefined) payload.deadline = data.deadline;
  if (data.emoji !== undefined) payload.emoji = data.emoji;
  if (data.color !== undefined) payload.color = data.color;

  const { data: row, error } = await supabase
    .from("saving_goals")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, title, target_amount, saved_amount, deadline, emoji, color")
    .single();

  if (error) {
    throw error;
  }

  return mapSavingGoal(requireData(row as SavingGoalRow | null, "Saving goal was not returned after update."));
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("saving_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
