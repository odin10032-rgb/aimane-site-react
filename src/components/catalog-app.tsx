"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Hero } from "@/components/site/hero";
import { ProductGrid } from "@/components/site/product-grid";
import { SiteFooter } from "@/components/site/site-footer";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AdminLoginDialog } from "@/components/admin/admin-login-dialog";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ProfileEditorDialog } from "@/components/admin/profile-editor-dialog";
import { DeleteProductDialog } from "@/components/admin/delete-product-dialog";
import {
  useProducts,
  useSettings,
  useSession,
  qk,
} from "@/hooks/use-catalog";
import type { Product, SiteSettings } from "@/lib/api";

interface CatalogAppProps {
  initialSettings: SiteSettings;
  initialProducts: Product[];
  initialIsAdmin: boolean;
}

export function CatalogApp({
  initialSettings,
  initialProducts,
  initialIsAdmin,
}: CatalogAppProps) {
  const qc = useQueryClient();

  // Hydrate React Query cache with server-fetched data so there's no flash
  // and the initial HTML is fully populated (good for SEO + UX).
  useEffect(() => {
    qc.setQueryData(qk.settings, { settings: initialSettings });
    qc.setQueryData(qk.products, { products: initialProducts });
    qc.setQueryData(qk.session, { isAdmin: initialIsAdmin, exp: null });
    // we intentionally only seed once on mount.
  }, []);

  const settingsQuery = useSettings();
  const productsQuery = useProducts();
  const sessionQuery = useSession();

  const settings = settingsQuery.data ?? initialSettings;
  const products = productsQuery.data ?? initialProducts;
  const isAdmin = sessionQuery.data?.isAdmin ?? initialIsAdmin;

  const [loginOpen, setLoginOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function openAdd() {
    setEditingProduct(null);
    setProductFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setProductFormOpen(true);
  }

  return (
    <main className="flex flex-1 flex-col">
      {isAdmin ? (
        <AdminToolbar onAddProduct={openAdd} onEditProfile={() => setProfileOpen(true)} />
      ) : null}

      <Hero settings={settings} />

      <ProductGrid
        products={products}
        isAdmin={isAdmin}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
        onAdd={openAdd}
      />

      <SiteFooter isAdmin={isAdmin} onOpenAdmin={() => setLoginOpen(true)} />

      {/* Dialogs */}
      <AdminLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
      />
      <ProfileEditorDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        settings={settings}
      />
      <DeleteProductDialog
        product={deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      />
    </main>
  );
}
