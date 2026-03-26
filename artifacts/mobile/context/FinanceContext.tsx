import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchTransactions,
  createTransaction as apiCreateTransaction,
  deleteTransaction as apiDeleteTransaction,
  fetchBudgets,
  updateBudget as apiUpdateBudget,
  fetchGoals,
  createGoal as apiCreateGoal,
  updateGoalSavedAmount as apiUpdateGoalSavedAmount,
  updateGoal as apiUpdateGoalFull,
  deleteGoal as apiDeleteGoal,
  type ApiTransaction,
  type ApiBudget,
  type ApiSavingGoal,
} from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export type TransactionCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "housing"
  | "health"
  | "education"
  | "income"
  | "other";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: TransactionCategory;
  date: string;
  note?: string | null;
};

export type Budget = {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
};

export type SavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  emoji: string;
  color: string;
};

type FinanceContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (id: string, spent: number) => Promise<void>;
  addSavingGoal: (g: Omit<SavingGoal, "id">) => Promise<void>;
  editSavingGoal: (id: string, data: Partial<Omit<SavingGoal, "id">>) => Promise<void>;
  updateSavingGoal: (id: string, savedAmount: number) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isLoading: boolean;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setSavingGoals([]);
      setIsLoading(false);
      return;
    }

    void loadData();
  }, [user?.id, isAuthLoading]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txData, budgetData, goalData] = await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
        fetchGoals(),
      ]);
      setTransactions(txData as Transaction[]);
      setBudgets(budgetData as Budget[]);
      setSavingGoals(goalData as SavingGoal[]);
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = useCallback(
    async (t: Omit<Transaction, "id">) => {
      try {
        const created = await apiCreateTransaction(t);
        setTransactions((prev) => [created as Transaction, ...prev]);
      } catch (err) {
        console.error("Failed to create transaction:", err);
        throw err;
      }
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        await apiDeleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("Failed to delete transaction:", err);
        throw err;
      }
    },
    []
  );

  const updateBudget = useCallback(
    async (id: string, spent: number) => {
      try {
        const updated = await apiUpdateBudget(id, spent);
        setBudgets((prev) =>
          prev.map((b) => (b.id === id ? (updated as Budget) : b))
        );
      } catch (err) {
        console.error("Failed to update budget:", err);
        throw err;
      }
    },
    []
  );

  const addSavingGoal = useCallback(
    async (g: Omit<SavingGoal, "id">) => {
      try {
        const created = await apiCreateGoal(g);
        setSavingGoals((prev) => [created as SavingGoal, ...prev]);
      } catch (err) {
        console.error("Failed to create goal:", err);
        throw err;
      }
    },
    []
  );

  const updateSavingGoal = useCallback(
    async (id: string, savedAmount: number) => {
      try {
        const updated = await apiUpdateGoalSavedAmount(id, savedAmount);
        setSavingGoals((prev) =>
          prev.map((g) => (g.id === id ? (updated as SavingGoal) : g))
        );
      } catch (err) {
        console.error("Failed to update goal:", err);
        throw err;
      }
    },
    []
  );

  const editSavingGoal = useCallback(
    async (id: string, data: Partial<Omit<SavingGoal, "id">>) => {
      try {
        const updated = await apiUpdateGoalFull(id, data);
        setSavingGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
        );
      } catch (err) {
        console.error("Failed to edit goal:", err);
        throw err;
      }
    },
    []
  );

  const deleteSavingGoal = useCallback(
    async (id: string) => {
      try {
        await apiDeleteGoal(id);
        setSavingGoals((prev) => prev.filter((g) => g.id !== id));
      } catch (err) {
        console.error("Failed to delete goal:", err);
        throw err;
      }
    },
    []
  );

  const clearAllData = useCallback(async () => {
    try {
      // Delete all transactions
      for (const t of transactions) {
        await apiDeleteTransaction(t.id);
      }
      // Delete all goals
      for (const g of savingGoals) {
        await apiDeleteGoal(g.id);
      }
      // Clear local state
      setTransactions([]);
      setSavingGoals([]);
    } catch (err) {
      console.error("Failed to clear all data:", err);
      throw err;
    }
  }, [transactions, savingGoals]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) - transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingGoals,
        addTransaction,
        deleteTransaction,
        updateBudget,
        addSavingGoal,
        editSavingGoal,
        updateSavingGoal,
        deleteSavingGoal,
        clearAllData,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        isLoading,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
