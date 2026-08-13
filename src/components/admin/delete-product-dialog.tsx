"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/hooks/use-catalog";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/api";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteProductDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProductDialog({
  product,
  onOpenChange,
}: DeleteProductDialogProps) {
  const del = useDeleteProduct();

  async function onConfirm() {
    if (!product) return;
    try {
      await del.mutateAsync(product.id);
      toast({
        title: "Produit supprimé",
        description: product.name,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Échec de la suppression",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <AlertDialog
      open={!!product}
      onOpenChange={(o) => !del.isPending && onOpenChange(o)}
    >
      <AlertDialogContent className="border-[#454C5E] bg-[#3A4150] text-[#F2F3F5]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#454C5E] bg-[#E5604C]/15 text-[#F08372]">
              <Trash2 className="h-4 w-4" />
            </span>
            Supprimer ce produit ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#9CA3AF]">
            « {product?.name} » sera définitivement retiré du catalogue. Cette
            action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={del.isPending}
            className="border-[#454C5E] bg-transparent text-[#9CA3AF] hover:bg-[#2F343E] hover:text-[#F2F3F5]"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={del.isPending}
            className="bg-[#E5604C] text-white hover:bg-[#F08372] disabled:opacity-50"
          >
            {del.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
