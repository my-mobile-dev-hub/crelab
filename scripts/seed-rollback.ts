import "dotenv/config";
import { db } from "../lib/db";
import * as s from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

const SEED_MARKER_KEY = "_seed_version";

async function main() {
  const force = process.argv.includes("--force");
  console.log("🗑️  Crelab DB Seed Rollback\n");

  const existing = await db.select().from(s.platformConfig).where(sql`${s.platformConfig.key} = ${SEED_MARKER_KEY}`);
  if (existing.length === 0) {
    if (!force) {
      console.log("⚠️  No seed marker found. Use --force to delete all data anyway.");
      process.exit(0);
    }
    console.log("   No seed marker found. --force flag set, deleting all data...\n");
  } else {
    console.log(`   Found seed: ${existing[0].value}\n`);
  }

  console.log("   Deleting seed data in reverse dependency order...");

  console.log("   → wallet_transactions");
  await db.delete(s.walletTransactions);

  console.log("   → booking_milestones");
  await db.delete(s.bookingMilestones);

  console.log("   → wallets");
  await db.delete(s.wallets);

  console.log("   → disputes");
  await db.delete(s.disputes);

  console.log("   → reviews");
  await db.delete(s.reviews);

  console.log("   → payments");
  await db.delete(s.payments);

  console.log("   → bookings");
  await db.delete(s.bookings);

  console.log("   → portfolio_items");
  await db.delete(s.portfolioItems);

  console.log("   → service_packages");
  await db.delete(s.servicePackages);

  console.log("   → providers");
  await db.delete(s.providers);

  console.log("   → consent_records");
  await db.delete(s.consentRecords);

  console.log("   → bug_reports");
  await db.delete(s.bugReports);

  console.log("   → audit_log");
  await db.delete(s.auditLog);

  console.log("   → accounts (Better Auth)");
  await db.delete(s.account);

  console.log("   → sessions (Better Auth)");
  await db.delete(s.session);

  console.log("   → verifications (Better Auth)");
  await db.delete(s.verification);

  console.log("   → users (Better Auth)");
  await db.delete(s.user);

  console.log("   → seed marker (platform_config)");
  await db.delete(s.platformConfig).where(eq(s.platformConfig.key, SEED_MARKER_KEY));

  console.log("\n✅ Seed rollback complete. All seed data removed.");
  console.log("   Run `npm run db:seed` to re-seed.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Rollback failed:", err);
  process.exit(1);
});
