import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { PlatformConfigService } from "@/services/PlatformConfigService";
import type { ICategoryConfig } from "@/types";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const config = await PlatformConfigService.get();
    return NextResponse.json({ success: true, data: config.categories });
  } catch (err) {
    if (err instanceof Error && (err.message === "Forbidden" || err.message === "Unauthorized")) {
      const status = err.message === "Forbidden" ? 403 : 401;
      return NextResponse.json({ success: false, error: err.message }, { status });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    const body = (await req.json()) as Partial<ICategoryConfig>;

    if (!body.slug || !body.label) {
      return NextResponse.json(
        { success: false, error: "Slug and label are required" },
        { status: 400 },
      );
    }

    const config = await PlatformConfigService.get();
    const existing = config.categories.find((c) => c.slug === body.slug);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    const newCategory: ICategoryConfig = {
      slug: body.slug,
      label: body.label,
      description: body.description ?? "",
      icon: body.icon ?? "folder",
      fieldSchema: body.fieldSchema ?? [],
      active: body.active ?? true,
    };

    const updatedCategories = [...config.categories, newCategory];
    await PlatformConfigService.set("categories", updatedCategories, session.user.id);

    return NextResponse.json({ success: true, data: newCategory });
  } catch (err) {
    if (err instanceof Error && (err.message === "Forbidden" || err.message === "Unauthorized")) {
      const status = err.message === "Forbidden" ? 403 : 401;
      return NextResponse.json({ success: false, error: err.message }, { status });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
