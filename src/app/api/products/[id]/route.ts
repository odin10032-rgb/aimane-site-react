import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullish(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().min(1).optional(),
  buyUrl: z.string().url().nullish().or(z.literal("").nullish()),
  order: z.number().int().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    throw e;
  }

  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const product = await db.product.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description ?? null }
        : {}),
      ...(parsed.data.price !== undefined ? { price: parsed.data.price } : {}),
      ...(parsed.data.imageUrl !== undefined
        ? { imageUrl: parsed.data.imageUrl }
        : {}),
      ...(parsed.data.buyUrl !== undefined
        ? { buyUrl: parsed.data.buyUrl || null }
        : {}),
      ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    throw e;
  }

  const { id } = await ctx.params;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
