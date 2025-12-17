import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema, insertCompanySchema, insertBankAccountSchema, insertCategorySchema, insertClientSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { registerUserSchema } = await import("@shared/schema");
      const data = registerUserSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
        role: "team",
      });

      const token = generateToken(user.id, user.email, user.name, user.role);
      const isProduction = process.env.NODE_ENV === "production";
      const isSecure = isProduction ? (req.protocol === "https" || req.get("x-forwarded-proto") === "https") : false;
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.isActive === "false") {
        return res.status(403).json({ error: "Account has been deactivated. Please contact your administrator." });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email, user.name, user.role);
      const isProduction = process.env.NODE_ENV === "production";
      const isSecure = isProduction ? (req.protocol === "https" || req.get("x-forwarded-proto") === "https") : false;
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/admin/create-user", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      const user = await storage.updateUserStatus(req.params.id, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/companies", authenticateToken, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/companies", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(data);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/companies/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, data);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/companies/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bank-accounts", authenticateToken, async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bank-accounts", authenticateToken, async (req, res) => {
    try {
      const data = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount({
        ...data,
        createdBy: (req as AuthRequest).user!.id,
      });
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/bank-accounts/:id", authenticateToken, async (req, res) => {
    try {
      const data = insertBankAccountSchema.partial().parse(req.body);
      const account = await storage.updateBankAccount(req.params.id, data);
      if (!account) {
        return res.status(404).json({ error: "Bank account not found" });
      }
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/bank-accounts/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteBankAccount(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/categories", authenticateToken, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/clients", authenticateToken, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clients", authenticateToken, async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/clients/:id", authenticateToken, async (req, res) => {
    try {
      const data = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, data);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/clients/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const { companyId, status, startDate, endDate } = req.query;
      const user = (req as AuthRequest).user!;
      
      const filters: any = {};
      if (user.role === "team") {
        filters.userId = user.id;
      }
      if (companyId) filters.companyId = companyId as string;
      if (status) filters.status = status as "pending" | "approved" | "rejected";
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/:id", authenticateToken, async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const user = (req as AuthRequest).user!;
      const data = insertTransactionSchema.parse(req.body);
      
      // Admin transactions are auto-approved
      const status = user.role === "admin" ? "approved" : "pending";
      
      const transaction = await storage.createTransaction({
        ...data,
        userId: user.id,
        status,
      } as any);

      // If admin and approved, update bank balances immediately
      if (user.role === "admin" && transaction.status === "approved") {
        if (transaction.type === "income" && transaction.fromBankAccountId) {
          const account = await storage.getBankAccountById(transaction.fromBankAccountId);
          if (account) {
            const newBalance = (parseFloat(account.currentBalance) + parseFloat(transaction.convertedInrAmount)).toFixed(2);
            await storage.updateBankAccountBalance(transaction.fromBankAccountId, newBalance);
          }
        } else if (transaction.type === "expense" && transaction.fromBankAccountId) {
          const account = await storage.getBankAccountById(transaction.fromBankAccountId);
          if (account) {
            const newBalance = (parseFloat(account.currentBalance) - parseFloat(transaction.convertedInrAmount)).toFixed(2);
            await storage.updateBankAccountBalance(transaction.fromBankAccountId, newBalance);
          }
        } else if (transaction.type === "transfer" && transaction.fromBankAccountId && transaction.toBankAccountId) {
          const fromAccount = await storage.getBankAccountById(transaction.fromBankAccountId);
          const toAccount = await storage.getBankAccountById(transaction.toBankAccountId);
          
          if (fromAccount && toAccount) {
            const newFromBalance = (parseFloat(fromAccount.currentBalance) - parseFloat(transaction.convertedInrAmount)).toFixed(2);
            const newToBalance = (parseFloat(toAccount.currentBalance) + parseFloat(transaction.convertedInrAmount)).toFixed(2);
            
            await storage.updateBankAccountBalance(transaction.fromBankAccountId, newFromBalance);
            await storage.updateBankAccountBalance(transaction.toBankAccountId, newToBalance);
          }
        }
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/transactions/:id", authenticateToken, async (req, res) => {
    try {
      const data = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, data);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ error: "Only pending transactions can be approved" });
      }

      const updated = await storage.updateTransactionStatus(req.params.id, "approved");

      if (transaction.type === "income" && transaction.fromBankAccountId) {
        const account = await storage.getBankAccountById(transaction.fromBankAccountId);
        if (account) {
          const newBalance = (parseFloat(account.currentBalance) + parseFloat(transaction.convertedInrAmount)).toFixed(2);
          await storage.updateBankAccountBalance(transaction.fromBankAccountId, newBalance);
        }
      } else if (transaction.type === "expense" && transaction.fromBankAccountId) {
        const account = await storage.getBankAccountById(transaction.fromBankAccountId);
        if (account) {
          const newBalance = (parseFloat(account.currentBalance) - parseFloat(transaction.convertedInrAmount)).toFixed(2);
          await storage.updateBankAccountBalance(transaction.fromBankAccountId, newBalance);
        }
      } else if (transaction.type === "transfer" && transaction.fromBankAccountId && transaction.toBankAccountId) {
        const fromAccount = await storage.getBankAccountById(transaction.fromBankAccountId);
        const toAccount = await storage.getBankAccountById(transaction.toBankAccountId);
        
        if (fromAccount && toAccount) {
          const fromBalance = (parseFloat(fromAccount.currentBalance) - parseFloat(transaction.convertedInrAmount)).toFixed(2);
          const toBalance = (parseFloat(toAccount.currentBalance) + parseFloat(transaction.convertedInrAmount)).toFixed(2);
          
          await storage.updateBankAccountBalance(transaction.fromBankAccountId, fromBalance);
          await storage.updateBankAccountBalance(transaction.toBankAccountId, toBalance);
        }
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions/:id/reject", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ error: "Only pending transactions can be rejected" });
      }

      const updated = await storage.updateTransactionStatus(req.params.id, "rejected");
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/profit-loss", authenticateToken, async (req, res) => {
    try {
      const { companyId, startDate, endDate } = req.query;
      
      const filters: any = { status: "approved" };
      if (companyId) filters.companyId = companyId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      
      const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
      
      const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
      
      res.json({
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        netProfit: (income - expense).toFixed(2),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/by-company", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = { status: "approved" };
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      const companies = await storage.getCompanies();
      
      const report = companies.map(company => {
        const companyTransactions = transactions.filter(t => t.company?.id === company.id);
        const income = companyTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const expense = companyTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        
        return {
          id: company.id,
          name: company.name,
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          netProfit: (income - expense).toFixed(2),
        };
      });
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/by-client", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = { status: "approved" };
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      const clients = await storage.getClients();
      
      const report = clients.map(client => {
        const clientTransactions = transactions.filter(t => t.client?.id === client.id);
        const income = clientTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const expense = clientTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        
        return {
          id: client.id,
          name: client.name,
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          netProfit: (income - expense).toFixed(2),
        };
      }).filter(r => parseFloat(r.income) > 0 || parseFloat(r.expense) > 0);
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/by-category", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = { status: "approved" };
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      const categories = await storage.getCategories();
      
      const report = categories.map(category => {
        const categoryTransactions = transactions.filter(t => t.category?.id === category.id);
        const income = categoryTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const expense = categoryTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        
        return {
          id: category.id,
          name: category.name,
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          netProfit: (income - expense).toFixed(2),
        };
      }).filter(r => parseFloat(r.income) > 0 || parseFloat(r.expense) > 0);
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/by-bank-account", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = { status: "approved" };
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(filters);
      const bankAccounts = await storage.getBankAccounts();
      
      const report = bankAccounts.map(account => {
        const accountTransactions = transactions.filter(t => 
          t.fromBankAccount?.id === account.id || t.toBankAccount?.id === account.id
        );
        const income = accountTransactions
          .filter(t => t.type === "income" && t.fromBankAccount?.id === account.id)
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const expense = accountTransactions
          .filter(t => t.type === "expense" && t.fromBankAccount?.id === account.id)
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const transferIn = accountTransactions
          .filter(t => t.type === "transfer" && t.toBankAccount?.id === account.id)
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        const transferOut = accountTransactions
          .filter(t => t.type === "transfer" && t.fromBankAccount?.id === account.id)
          .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount), 0);
        
        return {
          id: account.id,
          name: account.accountName,
          income: income.toFixed(2),
          expense: expense.toFixed(2),
          transferIn: transferIn.toFixed(2),
          transferOut: transferOut.toFixed(2),
          netProfit: (income - expense + transferIn - transferOut).toFixed(2),
        };
      }).filter(r => parseFloat(r.income) > 0 || parseFloat(r.expense) > 0 || parseFloat(r.transferIn) > 0 || parseFloat(r.transferOut) > 0);
      
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/export-csv", authenticateToken, async (req, res) => {
    try {
      const transactions = await storage.getTransactions({ status: "approved" });
      
      const csv = [
        ["Date", "Type", "Company", "Category", "Client", "Amount", "Currency", "INR Amount", "Description"].join(","),
        ...transactions.map(t => [
          t.createdAt.toISOString().split("T")[0],
          t.type,
          t.companyId,
          t.categoryId || "",
          t.clientId || "",
          t.amount,
          t.currency,
          t.convertedInrAmount,
          `"${t.description || ""}"`,
        ].join(",")),
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
