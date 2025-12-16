import { db } from "./db";
import { users, companies, categories, bankAccounts, clients } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const teamPassword = await bcrypt.hash("team123", 10);

  const [admin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@example.com",
    passwordHash: adminPassword,
    role: "admin",
  }).returning().onConflictDoNothing();

  const [teamMember] = await db.insert(users).values({
    name: "Team Member",
    email: "team@example.com",
    passwordHash: teamPassword,
    role: "team",
  }).returning().onConflictDoNothing();

  await db.insert(companies).values([
    { name: "Acme Corp", description: "Primary business entity" },
    { name: "Tech Solutions", description: "Technology consulting" },
    { name: "Retail Plus", description: "Retail operations" },
  ]).onConflictDoNothing();

  await db.insert(categories).values([
    { name: "Sales", description: "Revenue from sales" },
    { name: "Marketing", description: "Marketing expenses" },
    { name: "Operations", description: "Operational costs" },
    { name: "Consulting", description: "Consulting services" },
  ]).onConflictDoNothing();

  if (admin) {
    await db.insert(bankAccounts).values([
      { 
        accountName: "HDFC Bank - Current",
        initialBalance: "150000",
        currentBalance: "150000",
        createdBy: admin.id,
      },
      { 
        accountName: "SBI - Savings",
        initialBalance: "85000",
        currentBalance: "85000",
        createdBy: admin.id,
      },
      { 
        accountName: "ICICI Bank - Current",
        initialBalance: "60000",
        currentBalance: "60000",
        createdBy: admin.id,
      },
    ]).onConflictDoNothing();
  }

  await db.insert(clients).values([
    { 
      name: "TechStart Inc",
      email: "contact@techstart.com",
      phone: "+91 98765 43210",
      companyName: "TechStart Inc",
      notes: "Priority client",
    },
    { 
      name: "Global Traders",
      email: "info@globaltraders.com",
      phone: "+91 87654 32109",
      companyName: "Global Traders Ltd",
      notes: "International client",
    },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully!");
  console.log("\nTest credentials:");
  console.log("Admin: admin@example.com / admin123");
  console.log("Team: team@example.com / team123");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
