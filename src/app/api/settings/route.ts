import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  tagline: z.string().min(1).max(140).optional(),
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().optional(),
  accent: z.enum(["gold", "violet", "blue"]).optional(),
});

export async function GET() {
  let settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await db.siteSettings.create({
      data: {
        id: "default",
        name: "Aïmane Affagnon",
        tagline: "",
        bio: "",
        photoUrl: "",
        accent: "gold",
      },
    });
  }
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
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

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const settings = await db.siteSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: {
      id: "default",
      name: parsed.data.name ?? "Aïmane Affagnon",
      tagline: parsed.data.tagline ?? "",
      bio: parsed.data.bio ?? "",
      photoUrl: parsed.data.photoUrl ?? "",
      accent: parsed.data.accent ?? "gold",
    },
  });

  return NextResponse.json({ settings });
}
