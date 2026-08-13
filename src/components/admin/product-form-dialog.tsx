"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageCage } from "./image-cage";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-catalog";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/api";
import { Link2, Loader2, Package } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** product provided = edit mode. null/undefined = create mode. */
  product?: Product | null;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  buyUrl: string;
}

function initState(product?: Product | null): FormState {
  return product
    ? {
        name: product.name,
        description: product.description ?? "",
        price: String(product.price),
        imageUrl: product.imageUrl,
        buyUrl: product.buyUrl ?? "",
      }
    : {
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        buyUrl: "",
      };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin border-[#454C5E] bg-[#3A4150] text-[#F2F3F5] sm:max-w-lg">
        {/* Radix unmounts DialogContent when closed, so ProductForm remounts
            fresh every time the dialog opens → its useState initializer reads
            the latest product. No syncing effect needed. */}
        <ProductForm
          product={product}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  product,
  onClose,
}: {
  product?: Product | null;
  onClose: () => void;
}) {
  const isEdit = !!product;
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const [form, setForm] = useState<FormState>(() => initState(product));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Le nom est requis.";
    const priceNum = Number(form.price);
    if (!form.price.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      next.price = "Prix invalide (FCFA entier).";
    }
    if (!form.imageUrl.trim()) next.imageUrl = "Image requise.";
    if (form.buyUrl.trim()) {
      try {
        new URL(form.buyUrl);
      } catch {
        next.buyUrl = "URL invalide.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Math.round(Number(form.price)),
      imageUrl: form.imageUrl.trim(),
      buyUrl: form.buyUrl.trim() || null,
    };

    try {
      if (isEdit && product) {
        await update.mutateAsync({ id: product.id, input: payload });
        toast({ title: "Produit mis à jour" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Produit ajouté", description: payload.name });
      }
      onClose();
    } catch (err) {
      toast({
        title: "Échec de l'enregistrement",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  }

  const submitting = create.isPending || update.isPending;

  return (
    <>
      <DialogHeader>
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#454C5E] bg-[#262A33] text-[#E7B760]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg">
              {isEdit ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              {isEdit
                ? "Mettez à jour les informations du produit."
                : "Ajoutez un produit au catalogue."}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-5">
        <ImageCage
          label="Image du produit"
          value={form.imageUrl}
          onChange={(url) => set("imageUrl", url)}
        />
        {errors.imageUrl ? (
          <p className="-mt-3 text-xs text-[#F08372]">{errors.imageUrl}</p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="p-name" className="text-[#F2F3F5]">
            Nom du produit
          </Label>
          <Input
            id="p-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex: Programme Business Accelerator"
            className="border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
          />
          {errors.name ? (
            <p className="text-xs text-[#F08372]">{errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-desc" className="text-[#F2F3F5]">
            Description
          </Label>
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Décrivez le produit en quelques lignes…"
            rows={3}
            className="scrollbar-thin resize-none border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-price" className="text-[#F2F3F5]">
              Prix (FCFA)
            </Label>
            <Input
              id="p-price"
              inputMode="numeric"
              value={form.price}
              onChange={(e) =>
                set("price", e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="49000"
              className="border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
            />
            {errors.price ? (
              <p className="text-xs text-[#F08372]">{errors.price}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-buy" className="text-[#F2F3F5]">
              Lien de vente
            </Label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id="p-buy"
                value={form.buyUrl}
                onChange={(e) => set("buyUrl", e.target.value)}
                placeholder="https://..."
                className="border-[#454C5E] bg-[#262A33] pl-9 text-[#F2F3F5] placeholder:text-[#5A6377]"
              />
            </div>
            {errors.buyUrl ? (
              <p className="text-xs text-[#F08372]">{errors.buyUrl}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="text-[#9CA3AF] hover:bg-[#2F343E] hover:text-[#F2F3F5]"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#E7B760] text-[#1B1E25] hover:bg-[#F0C574] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? "Enregistrer" : "Ajouter le produit"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
