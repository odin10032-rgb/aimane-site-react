import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { CatalogApp } from "@/components/catalog-app";

export const dynamic = "force-dynamic";

async function getData() {
  const [products, settingsRow, session] = await Promise.all([
    db.product.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    db.siteSettings.findUnique({ where: { id: "default" } }),
    getAdminSession(),
  ]);

  // Fallback settings (shouldn't happen since we seeded, but be defensive).
  const settings = settingsRow ?? {
    id: "default",
    name: "Aïmane Affagnon",
    tagline: "",
    bio: "",
    photoUrl: "",
    accent: "gold" as const,
    updatedAt: new Date(),
  };

  return {
    products: products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    settings: {
      ...settings,
      updatedAt:
        settings.updatedAt instanceof Date
          ? settings.updatedAt.toISOString()
          : new Date().toISOString(),
    },
    isAdmin: !!session,
  };
}

export default async function Page() {
  const { products, settings, isAdmin } = await getData();

  return (
    <CatalogApp
      initialSettings={settings}
      initialProducts={products}
      initialIsAdmin={isAdmin}
    />
  );
}
