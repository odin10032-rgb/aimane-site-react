import { NextResponse } from "next/server";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }

  // Small constant-time-ish delay to limit brute-force timing leaks.
  await new Promise((r) => setTimeout(r, 250));

  if (!verifyPassword(parsed.data.password)) {
    return NextResponse.json(
      { error: "Mot de passe incorrect" },
      { status: 401 }
    );
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
