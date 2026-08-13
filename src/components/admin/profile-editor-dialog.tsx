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
import { useUpdateSettings } from "@/hooks/use-catalog";
import { toast } from "@/hooks/use-toast";
import type { SiteSettings } from "@/lib/api";
import { Loader2, UserRound } from "lucide-react";

interface ProfileEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SiteSettings | undefined;
}

interface FormState {
  name: string;
  tagline: string;
  bio: string;
  photoUrl: string;
}

function initState(settings?: SiteSettings): FormState {
  return settings
    ? {
        name: settings.name,
        tagline: settings.tagline,
        bio: settings.bio,
        photoUrl: settings.photoUrl,
      }
    : { name: "", tagline: "", bio: "", photoUrl: "" };
}

export function ProfileEditorDialog({
  open,
  onOpenChange,
  settings,
}: ProfileEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin border-[#454C5E] bg-[#3A4150] text-[#F2F3F5] sm:max-w-lg">
        {/* Remounts on each open (Radix unmounts closed content) so the form
            state initializer picks up the latest settings. */}
        <ProfileForm
          settings={settings}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProfileForm({
  settings,
  onClose,
}: {
  settings: SiteSettings | undefined;
  onClose: () => void;
}) {
  const update = useUpdateSettings();
  const [form, setForm] = useState<FormState>(() => initState(settings));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    try {
      await update.mutateAsync({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        bio: form.bio.trim(),
        photoUrl: form.photoUrl.trim(),
      });
      toast({ title: "Profil mis à jour" });
      onClose();
    } catch (err) {
      toast({
        title: "Échec de la mise à jour",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  }

  const submitting = update.isPending;

  return (
    <>
      <DialogHeader>
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#454C5E] bg-[#262A33] text-[#E7B760]">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg">Modifier le profil</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              Photo, nom, accroche et bio affichés en haut de la page.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-5">
        <ImageCage
          label="Photo (hero)"
          aspectClassName="aspect-square max-w-[220px]"
          value={form.photoUrl}
          onChange={(url) => set("photoUrl", url)}
        />
        <p className="-mt-3 text-xs text-[#9CA3AF]">
          Laissez vide pour afficher un monogramme élégant par défaut.
        </p>

        <div className="space-y-2">
          <Label htmlFor="pr-name" className="text-[#F2F3F5]">
            Nom
          </Label>
          <Input
            id="pr-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Aïmane Affagnon"
            className="border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
          />
          {error ? <p className="text-xs text-[#F08372]">{error}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pr-tagline" className="text-[#F2F3F5]">
            Accroche / tagline
          </Label>
          <Input
            id="pr-tagline"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Entrepreneur · Formation business"
            className="border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pr-bio" className="text-[#F2F3F5]">
            Bio
          </Label>
          <Textarea
            id="pr-bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Présentez Aïmane en quelques phrases…"
            rows={4}
            className="scrollbar-thin resize-none border-[#454C5E] bg-[#262A33] text-[#F2F3F5] placeholder:text-[#5A6377]"
          />
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
            Enregistrer
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
