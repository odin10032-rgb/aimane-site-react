import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin, requireAdmin, UnauthorizedError } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullish(),
  price: z.number().int().min(0),
  imageUrl: z.string().min(1),
  buyUrl: z.string().url().nullish().or(z.literal("").nullish()),
  order: z.number().int().optional(),
});

export async function GET() {
  const products = await db.product.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    throw e;
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Determine next order if not provided.
  let order = parsed.data.order;
  if (order === undefined) {
    const max = await db.product.aggregate({ _max: { order: true } });
    order = (max._max.order ?? -1) + 1;
  }

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      imageUrl: parsed.data.imageUrl,
      buyUrl: parsed.data.buyUrl || null,
      order,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}

export async function PUT() {
  // Admin check helper reused by reordering endpoint if needed in the future.
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
