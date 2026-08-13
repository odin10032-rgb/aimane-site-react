"use client";

import { useId, useRef, useState } from "react";
import { api } from "@/lib/api";
import { ImagePlus, Loader2, RefreshCw, UploadCloud } from "lucide-react";

interface ImageCageProps {
  /** Current image URL (empty = no image yet). */
  value: string;
  /** Called whenever a new URL is produced by an upload. */
  onChange: (url: string) => void;
  /** Optional aspect class, defaults to square-ish 4/3. */
  aspectClassName?: string;
  label?: string;
}

export function ImageCage({
  value,
  onChange,
  aspectClassName = "aspect-[4/3]",
  label = "Image",
}: ImageCageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImage = value && value.trim().length > 0;

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      onChange(res.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#F2F3F5]"
        >
          {label}
        </label>
      ) : null}

      <div
        className={`cage-border group relative flex ${aspectClassName} w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[#2F343E] transition-colors ${
          dragging ? "is-drag" : ""
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          void handleFile(f);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {hasImage ? (
          <img
            src={value}
            alt="Aperçu"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#454C5E] bg-[#3A4150] text-[#E7B760]">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5" />
              )}
            </div>
            <p className="text-sm font-medium text-[#F2F3F5]">
              {uploading
                ? "Upload en cours…"
                : "Cliquez ou glissez une image ici"}
            </p>
            <p className="text-xs text-[#9CA3AF]">
              JPG, PNG, WebP — 6 Mo max
            </p>
          </div>
        )}

        {/* Hover overlay: change image */}
        {hasImage && !uploading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#262A33]/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E7B760] px-3 py-1.5 text-xs font-semibold text-[#1B1E25]">
              <RefreshCw className="h-3.5 w-3.5" />
              Changer l&apos;image
            </span>
          </div>
        ) : null}

        {!hasImage && !uploading ? (
          <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-[#454C5E] bg-[#262A33]/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF] backdrop-blur">
            <ImagePlus className="h-3 w-3" />
            Cage image
          </span>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          void handleFile(f);
          // reset so the same file can be re-selected
          e.target.value = "";
        }}
      />

      {/* Resulting URL — stored internally in the form, shown on screen */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={value}
          placeholder="L'URL de l'image apparaîtra ici après l'upload"
          className="w-full rounded-lg border border-[#454C5E] bg-[#262A33] px-3 py-2 font-mono text-xs text-[#9CA3AF] outline-none"
        />
      </div>

      {error ? (
        <p className="text-xs text-[#F08372]">{error}</p>
      ) : null}
    </div>
  );
}
