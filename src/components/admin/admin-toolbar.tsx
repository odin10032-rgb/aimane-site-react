"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-catalog";
import { toast } from "@/hooks/use-toast";
import { LogOut, Package, UserRound, ShieldCheck } from "lucide-react";

interface AdminToolbarProps {
  onAddProduct: () => void;
  onEditProfile: () => void;
}

export function AdminToolbar({
  onAddProduct,
  onEditProfile,
}: AdminToolbarProps) {
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      toast({ title: "Déconnecté", description: "À bientôt." });
    } catch {
      toast({ title: "Erreur lors de la déconnexion", variant: "destructive" });
    }
  }

  return (
    <div className="sticky top-3 z-40 mx-auto w-[calc(100%-1.5rem)] max-w-3xl">
      <div className="glass flex items-center gap-2 rounded-2xl border border-[#454C5E] px-3 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
        <span className="hidden items-center gap-1.5 rounded-full border border-[#E7B760]/40 bg-[#E7B760]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E7B760] sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin
        </span>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onEditProfile}
            variant="outline"
            className="h-9 border-[#454C5E] bg-transparent text-[#F2F3F5] hover:bg-[#2F343E] hover:text-[#E7B760]"
          >
            <UserRound className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
            <span className="sm:hidden">Profil</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onAddProduct}
            className="h-9 bg-[#E7B760] text-[#1B1E25] hover:bg-[#F0C574]"
          >
            <Package className="mr-1.5 h-4 w-4" />
            Produit
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleLogout}
            variant="outline"
            className="h-9 border-[#454C5E] bg-transparent text-[#9CA3AF] hover:bg-[#2F343E] hover:text-[#F08372]"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Déconnexion</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
