"use client";

import { Product, formatPrice } from "@/lib/api";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({
  product,
  isAdmin,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const hasBuy = !!product.buyUrl;

  return (
    <article className="card-premium group relative flex flex-col overflow-hidden rounded-2xl border border-[#454C5E] bg-[#3A4150] transition-colors hover:border-[#5A6377]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#2F343E]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A4150]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {isAdmin ? (
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              aria-label="Modifier"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#454C5E] bg-[#262A33]/85 text-[#F2F3F5] backdrop-blur transition-colors hover:bg-[#3A4150] hover:text-[#E7B760]"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(product)}
              aria-label="Supprimer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#454C5E] bg-[#262A33]/85 text-[#F2F3F5] backdrop-blur transition-colors hover:bg-[#E5604C]/15 hover:text-[#F08372]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-[#F2F3F5]">
            {product.name}
          </h3>
          <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#E7B760]">
            {formatPrice(product.price)}
          </span>
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-[#9CA3AF]">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto pt-2">
          {hasBuy ? (
            <a
              href={product.buyUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E7B760] px-4 py-2.5 text-sm font-semibold text-[#1B1E25] transition-all hover:bg-[#F0C574] hover:shadow-[0_6px_20px_-6px_rgba(231,183,96,0.6)]"
            >
              Acheter
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#454C5E] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#9CA3AF]"
            >
              Bientôt en vente
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
