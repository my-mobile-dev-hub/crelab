import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { PlatformConfigService } from "@/services/PlatformConfigService";
import type { ICategoryConfig } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireRole("ADMIN");
    const { slug } = await params;
    const body = (await req.json()) as Partial<ICategoryConfig>;

    const config = await PlatformConfigService.get();
    const index = config.categories.findIndex((c) => c.slug === slug);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const updated: ICategoryConfig = {
      ...config.categories[index],
      ...body,
    };

    const updatedCategories = [...config.categories];
    updatedCategories[index] = updated;

    await PlatformConfigService.set("categories", updatedCategories, session.user.id);

    return NextResponse.json({ success: true, data: updated });
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireRole("ADMIN");
    const { slug } = await params;

    const config = await PlatformConfigService.get();
    const index = config.categories.findIndex((c) => c.slug === slug);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const updatedCategories = config.categories.map((c, i) =>
      i === index ? { ...c, active: false } : c,
    );

    await PlatformConfigService.set("categories", updatedCategories, session.user.id);

    return NextResponse.json({ success: true });
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
