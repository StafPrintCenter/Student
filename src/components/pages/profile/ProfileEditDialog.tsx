import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useUpdateStudentProfile } from "@/stores/useAccountStore";
import type { StudentProfilePayload } from "@/data/account";

const schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  phone: z.string().trim().max(30).optional(),
  birthDate: z.string().trim().optional(),
  address: z.string().trim().max(255).optional(),
  occupation: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(1000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProfileEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, setUser } = useStudentAuth();
  const updateMutation = useUpdateStudentProfile();

  const initial = useMemo<FormValues>(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      birthDate: user?.birthDate ?? "",
      address: user?.address ?? "",
      occupation: user?.occupation ?? "",
      bio: user?.bio ?? "",
    }),
    [user]
  );

  const [form, setForm] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // Réinitialise le formulaire à chaque ouverture
  useEffect(() => {
    if (open) {
      setForm(initial);
      setErrors({});
      setPhoto(null);
      setRemovePhoto(false);
    }
  }, [open, initial]);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const currentPhoto = removePhoto ? null : (preview ?? user?.photo ?? null);

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload: StudentProfilePayload = {
      ...parsed.data,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      photo,
      removePhoto,
    };

    updateMutation.mutate(payload, {
      onSuccess: (profile) => {
        setUser(profile);
        toast.success("Profil modifié");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la modification"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-muted text-xs text-muted-foreground">
              {currentPhoto ? <img src={currentPhoto} alt="" className="h-full w-full object-cover" /> : "Aucune"}
            </div>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                disabled={updateMutation.isPending}
                onChange={(e) => {
                  setPhoto(e.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
              />
              {user?.photo && (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(e) => { setRemovePhoto(e.target.checked); if (e.target.checked) setPhoto(null); }}
                  />
                  Supprimer ma photo actuelle
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Prénom</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label>Date de naissance</Label>
              <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>Profession</Label>
              <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Biographie</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}