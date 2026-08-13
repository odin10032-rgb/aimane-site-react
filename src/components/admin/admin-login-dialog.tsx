"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-catalog";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminLoginDialog({
  open,
  onOpenChange,
}: AdminLoginDialogProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const login = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    try {
      await login.mutateAsync(password);
      toast({
        title: "Connecté",
        description: "Bienvenue dans l'espace administrateur.",
      });
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Connexion refusée",
        description:
          err instanceof Error ? err.message : "Mot de passe incorrect.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#454C5E] bg-[#3A4150] text-[#F2F3F5] sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#454C5E] bg-[#262A33] text-[#E7B760]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Espace administrateur</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Saisissez le mot de passe pour gérer le catalogue et le profil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-[#F2F3F5]">
              Mot de passe
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                id="admin-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="border-[#454C5E] bg-[#262A33] pl-9 pr-10 text-[#F2F3F5] placeholder:text-[#5A6377]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Masquer" : "Afficher"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F2F3F5]"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#9CA3AF] hover:bg-[#2F343E] hover:text-[#F2F3F5]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={login.isPending || !password}
              className="bg-[#E7B760] text-[#1B1E25] hover:bg-[#F0C574] disabled:opacity-50"
            >
              {login.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Se connecter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
