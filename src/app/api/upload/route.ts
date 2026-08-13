import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/lib/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "image";
}

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function uniqueName(originalName: string | null, mime: string): string {
  const ts = Date.now();
  const extFromName = originalName
    ? path.extname(originalName).replace(/^\./, "").toLowerCase()
    : "";
  const ext = extFromName || extFromMime(mime);
  const baseName = originalName
    ? path.basename(originalName, path.extname(originalName))
    : "";
  return `${ts}-${slugify(baseName)}.${ext}`;
}

async function commitToGitHub(
  filename: string,
  base64: string,
  mime: string
): Promise<{ url: string } | { error: string; status: number }> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const folder = process.env.GITHUB_PATH || "products";

  if (!token || !owner || !repo) {
    return { error: "GitHub non configuré", status: 500 };
  }

  const filePath = `${folder}/${filename}`;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore(media): add ${filename}`,
        content: base64,
        branch,
        committer: {
          name: "Aïmane Media Bot",
          email: "media-bot@aimane.local",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      error: `Échec de l'upload GitHub (${res.status})`,
      status: 502,
    };
  }

  // Prefer the canonical raw URL so it's stable and hot-linkable.
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  return { url };
}

async function saveLocally(
  filename: string,
  bytes: Uint8Array
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  await writeFile(full, bytes);
  return `/uploads/${filename}`;
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

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "Formulaire attendu (multipart/form-data)" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 6 Mo)" },
      { status: 400 }
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      {
        error: "Format non supporté (JPG, PNG, WebP, GIF, AVIF)",
      },
      { status: 400 }
    );
  }

  const filename = uniqueName(file.name, mime);
  const bytes = new Uint8Array(await file.arrayBuffer());

  // If GitHub is configured, commit there. Otherwise fall back to local
  // storage so the app stays fully functional in dev / without a token.
  const token = process.env.GITHUB_TOKEN;
  const hasGithub =
    !!token &&
    !!process.env.GITHUB_OWNER &&
    !!process.env.GITHUB_REPO;

  if (hasGithub) {
    const base64 = Buffer.from(bytes).toString("base64");
    const result = await commitToGitHub(filename, base64, mime);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      url: result.url,
      filename,
      storage: "github",
    });
  }

  // Local fallback.
  const url = await saveLocally(filename, bytes);
  return NextResponse.json({ url, filename, storage: "local" });
}
