"use client";

import { SiteSettings } from "@/lib/api";
import { Sparkles } from "lucide-react";

export function Hero({ settings }: { settings: SiteSettings }) {
  const hasPhoto = settings.photoUrl && settings.photoUrl.trim().length > 0;
  const initials = settings.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <section className="relative">
      {/* subtle gold glow behind portrait */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(231,183,96,0.35), transparent)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pt-16 pb-12 sm:pt-24 md:flex-row md:items-center md:gap-14 md:pt-28">
        {/* Portrait */}
        <div className="relative shrink-0">
          <div className="card-premium flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-[#454C5E] bg-[#3A4150] sm:h-44 sm:w-44">
            {hasPhoto ? (
              <img
                src={settings.photoUrl}
                alt={settings.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gold-gradient text-5xl font-bold tracking-tight">
                {initials || "AA"}
              </span>
            )}
          </div>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#454C5E] bg-[#262A33] text-[#E7B760]">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>

        {/* Name + bio */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#9CA3AF]">
            Catalogue & offres
          </p>
          <h1 className="text-gold-gradient text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {settings.name}
          </h1>
          {settings.tagline ? (
            <p className="mt-3 text-lg text-[#F2F3F5] sm:text-xl">
              {settings.tagline}
            </p>
          ) : null}
          {settings.bio ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#9CA3AF] sm:text-base md:mx-0">
              {settings.bio}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
