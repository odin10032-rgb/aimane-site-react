"use client";

import { Product } from "@/lib/api";
import { ProductCard } from "./product-card";
import { PackageOpen, Plus } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  isAdmin: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onAdd?: () => void;
}

export function ProductGrid({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section id="catalogue" className="mx-auto w-full max-w-6xl px-4 py-10">
        <SectionHeading />

        <div className="card-premium mt-8 flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-[#454C5E] bg-[#3A4150]/60 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#454C5E] bg-[#262A33] text-[#E7B760]">
            <PackageOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-[#F2F3F5]">
              Bientôt disponible
            </h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-[#9CA3AF]">
              Le catalogue est en cours de préparation. Les premiers produits
              et programmes d&apos;Aïmane Affagnon seront publiés ici très
              prochainement.
            </p>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E7B760] px-4 py-2.5 text-sm font-semibold text-[#1B1E25] transition-colors hover:bg-[#F0C574]"
            >
              <Plus className="h-4 w-4" />
              Ajouter le premier produit
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id="catalogue" className="mx-auto w-full max-w-6xl px-4 py-10">
      <SectionHeading count={products.length} />

      {isAdmin ? (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-[#454C5E] bg-[#3A4150] px-4 py-2 text-sm font-semibold text-[#F2F3F5] transition-colors hover:border-[#E7B760] hover:text-[#E7B760]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ count }: { count?: number }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#9CA3AF]">
          Catalogue
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#F2F3F5] sm:text-3xl">
          Produits & programmes
        </h2>
      </div>
      {typeof count === "number" ? (
        <span className="hidden text-sm text-[#9CA3AF] sm:block">
          {count} {count > 1 ? "produits" : "produit"}
        </span>
      ) : null}
    </div>
  );
}
