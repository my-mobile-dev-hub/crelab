import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { platformConfig, auditLog } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_CONFIG } from "@/config/platform.config";
import type { IPlatformConfig } from "@/types";

export class PlatformConfigService {
  static async get(): Promise<IPlatformConfig> {
    const rows = await db.select().from(platformConfig);
    const merged = { ...DEFAULT_CONFIG };

    for (const row of rows) {
      const key = row.key as keyof IPlatformConfig;
      if (key in merged && row.value !== null) {
        (merged as Record<string, unknown>)[key] = row.value;
      }
    }

    return merged;
  }

  static async set(
    key: string,
    value: unknown,
    adminId: string,
  ): Promise<void> {
    const existing = await db
      .select()
      .from(platformConfig)
      .where(eq(platformConfig.key, key))
      .limit(1);

    const oldValue = existing[0]?.value ?? null;

    if (existing.length > 0) {
      await db
        .update(platformConfig)
        .set({ value, updatedAt: new Date() })
        .where(eq(platformConfig.key, key));
    } else {
      await db.insert(platformConfig).values({
        id: crypto.randomUUID(),
        key,
        value,
      });
    }

    await db.insert(auditLog).values({
      id: crypto.randomUUID(),
      userId: adminId,
      action: "config.update",
      entity: key,
      oldValue,
      newValue: value,
    });

    revalidateTag("platform-config");
  }

  static getCached = unstable_cache(
    async () => this.get(),
    ["platform-config"],
    { revalidate: 300, tags: ["platform-config"] },
  );
}
