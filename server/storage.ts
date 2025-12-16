import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUserWithHash,
  Company,
  InsertCompany,
  BankAccount,
  InsertBankAccount,
  Category,
  InsertCategory,
  Client,
  InsertClient,
  Transaction,
  InsertTransaction,
} from "@shared/schema";

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUserWithHash): Promise<User>;
  updateUserStatus(id: string, isActive: string): Promise<User | undefined>;
  
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<void>;
  
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccountById(id: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: string, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  updateBankAccountBalance(id: string, newBalance: string): Promise<void>;
  deleteBankAccount(id: string): Promise<void>;
  
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<void>;
  
  getTransactions(filters?: {
    userId?: string;
    companyId?: string;
    status?: "pending" | "approved" | "rejected";
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async createUser(user: InsertUserWithHash): Promise<User> {
    const [newUser] = await db.insert(schema.users).values({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role || "team",
    }).returning();
    return newUser;
  }

  async updateUserStatus(id: string, isActive: string): Promise<User | undefined> {
    const [updated] = await db.update(schema.users)
      .set({ isActive: isActive })
      .where(eq(schema.users.id, id))
      .returning();
    return updated;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(schema.companies).orderBy(desc(schema.companies.createdAt));
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(schema.companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db.update(schema.companies).set(company).where(eq(schema.companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(schema.companies).where(eq(schema.companies.id, id));
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    return await db.select().from(schema.bankAccounts).orderBy(desc(schema.bankAccounts.createdAt));
  }

  async getBankAccountById(id: string): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.id, id));
    return account;
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [newAccount] = await db.insert(schema.bankAccounts).values({
      ...account,
      currentBalance: account.initialBalance,
    }).returning();
    return newAccount;
  }

  async updateBankAccount(id: string, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [updated] = await db.update(schema.bankAccounts).set(account).where(eq(schema.bankAccounts.id, id)).returning();
    return updated;
  }

  async updateBankAccountBalance(id: string, newBalance: string): Promise<void> {
    await db.update(schema.bankAccounts).set({ currentBalance: newBalance }).where(eq(schema.bankAccounts.id, id));
  }

  async deleteBankAccount(id: string): Promise<void> {
    await db.delete(schema.bankAccounts).where(eq(schema.bankAccounts.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories).orderBy(schema.categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(schema.categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(schema.categories).set(category).where(eq(schema.categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(schema.clients).orderBy(desc(schema.clients.createdAt));
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(schema.clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(schema.clients).set(client).where(eq(schema.clients.id, id)).returning();
    return updated;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(schema.clients).where(eq(schema.clients.id, id));
  }

  async getTransactions(filters?: {
    userId?: string;
    companyId?: string;
    status?: "pending" | "approved" | "rejected";
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const conditions = [];
    if (filters?.userId) conditions.push(eq(schema.transactions.userId, filters.userId));
    if (filters?.companyId) conditions.push(eq(schema.transactions.companyId, filters.companyId));
    if (filters?.status) conditions.push(eq(schema.transactions.status, filters.status));
    if (filters?.startDate) conditions.push(gte(schema.transactions.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(schema.transactions.createdAt, filters.endDate));
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await db
      .select({
        id: schema.transactions.id,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        currency: schema.transactions.currency,
        conversionRate: schema.transactions.conversionRate,
        convertedInrAmount: schema.transactions.convertedInrAmount,
        description: schema.transactions.description,
        transactionDate: schema.transactions.createdAt,
        status: schema.transactions.status,
        createdAt: schema.transactions.createdAt,
        updatedAt: schema.transactions.updatedAt,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
        },
        client: {
          id: schema.clients.id,
          name: schema.clients.name,
        },
        company: {
          id: schema.companies.id,
          name: schema.companies.name,
        },
        fromBankAccount: {
          id: schema.bankAccounts.id,
          accountName: schema.bankAccounts.accountName,
        },
        toBankAccount: {
          id: schema.bankAccounts.id,
          accountName: schema.bankAccounts.accountName,
        },
        user: {
          id: schema.users.id,
          name: schema.users.name,
        },
      })
      .from(schema.transactions)
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .leftJoin(schema.clients, eq(schema.transactions.clientId, schema.clients.id))
      .leftJoin(schema.companies, eq(schema.transactions.companyId, schema.companies.id))
      .leftJoin(schema.bankAccounts, eq(schema.transactions.fromBankAccountId, schema.bankAccounts.id))
      .leftJoin(schema.users, eq(schema.transactions.userId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.transactions.createdAt));

    return results.map(r => ({
      ...r,
      category: r.category?.id ? r.category : null,
      client: r.client?.id ? r.client : null,
      fromBankAccount: r.fromBankAccount?.id ? r.fromBankAccount : null,
      toBankAccount: null, // Will handle this separately for transfers
    }));
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const convertedAmount = transaction.currency === "USD" && transaction.conversionRate
      ? (parseFloat(transaction.amount) * parseFloat(transaction.conversionRate)).toFixed(2)
      : transaction.amount;

    const [newTransaction] = await db.insert(schema.transactions).values({
      ...transaction,
      convertedInrAmount: convertedAmount,
    }).returning();
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateData: any = { ...transaction, updatedAt: new Date() };
    
    if (transaction.amount || transaction.currency || transaction.conversionRate) {
      const current = await this.getTransactionById(id);
      if (current) {
        const amount = transaction.amount || current.amount;
        const currency = transaction.currency || current.currency;
        const conversionRate = transaction.conversionRate || current.conversionRate;
        
        updateData.convertedInrAmount = currency === "USD" && conversionRate
          ? (parseFloat(amount) * parseFloat(conversionRate)).toFixed(2)
          : amount;
      }
    }
    
    const [updated] = await db.update(schema.transactions).set(updateData).where(eq(schema.transactions.id, id)).returning();
    return updated;
  }

  async updateTransactionStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<Transaction | undefined> {
    const [updated] = await db.update(schema.transactions)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.transactions.id, id))
      .returning();
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }
}

export const storage = new DbStorage();
