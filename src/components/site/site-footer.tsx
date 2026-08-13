"use client";

import { Lock } from "lucide-react";

interface SiteFooterProps {
  isAdmin: boolean;
  onOpenAdmin?: () => void;
}

export function SiteFooter({ isAdmin, onOpenAdmin }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[#454C5E]/70 bg-[#262A33]/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-center text-sm text-[#9CA3AF] sm:text-left">
          © {year} Aïmane Affagnon. Tous droits réservés.
        </p>

        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-[#9CA3AF] sm:inline">
            Site & catalogue
          </span>
          {!isAdmin ? (
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Espace administrateur"
              className="flex items-center gap-1.5 rounded-lg border border-[#454C5E] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#5A6377] hover:text-[#F2F3F5]"
            >
              <Lock className="h-3.5 w-3.5" />
              Admin
            </button>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
