import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_WEEKDAYS,
  notificationCategoryMap,
  notificationDeliveryModeLabels,
  toTimeInput,
  type APINotificationPreference,
  type NotificationCategory,
  type NotificationDeliveryMode,
  type NotificationPreferencePayload,
} from "@/data/notifications";
import { NotificationCategoryIcon } from "@/components/portal/notifications/notification-category";
import { useUpdateNotificationPreference } from "@/stores/useNotificationsStore";

// Valeurs proposées quand on passe en mode programmé sans horaire existant
const DEFAULT_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_START = "08:00";
const DEFAULT_END = "18:00";

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

export function NotificationPreferenceCard({ preference }: { preference: APINotificationPreference }) {
  const config = notificationCategoryMap[preference.category as NotificationCategory];
  const label = config?.label ?? preference.category;
  const locked = preference.locked;

  const initialDays = preference.scheduleDays ?? [];
  const initialStart = toTimeInput(preference.scheduleStartTime);
  const initialEnd = toTimeInput(preference.scheduleEndTime);

  const [enabled, setEnabled] = useState(preference.enabled);
  const [mode, setMode] = useState<NotificationDeliveryMode>(preference.deliveryMode);
  const [days, setDays] = useState<number[]>(initialDays);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateNotificationPreference();

  const isDirty =
    enabled !== preference.enabled ||
    mode !== preference.deliveryMode ||
    (mode === "scheduled" && (!sameDays(days, initialDays) || start !== initialStart || end !== initialEnd));

  const changeMode = (next: NotificationDeliveryMode) => {
    setMode(next);
    setError(null);
    if (next === "scheduled") {
      if (days.length === 0) setDays(DEFAULT_DAYS);
      if (!start) setStart(DEFAULT_START);
      if (!end) setEnd(DEFAULT_END);
    }
  };

  const toggleDay = (value: number) =>
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));

  const handleSave = () => {
    setError(null);

    if (mode === "scheduled") {
      if (days.length === 0) return setError("Choisissez au moins un jour.");
      if (!start || !end) return setError("Renseignez l'heure de début et l'heure de fin.");
      if (end <= start) return setError("L'heure de fin doit être postérieure à l'heure de début.");
    }

    const payload: NotificationPreferencePayload =
      mode === "scheduled"
        ? { enabled, deliveryMode: "scheduled", scheduleDays: days, scheduleStartTime: start, scheduleEndTime: end }
        : { enabled, deliveryMode: "instant" };

    updateMutation.mutate(
      { category: preference.category, payload },
      {
        onSuccess: () => toast.success(`Préférence « ${label} » mise à jour.`),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour"),
      }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <NotificationCategoryIcon category={preference.category} className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {label}
              {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Verrouillée" />}
            </CardTitle>
            {config && <CardDescription className="text-xs">{config.description}</CardDescription>}
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={locked || updateMutation.isPending}
          aria-label={`Activer les notifications ${label}`}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {locked ? (
          <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            Ces notifications sont toujours actives et envoyées instantanément : elles ne peuvent pas être modifiées.
          </p>
        ) : (
          <div className={cn("space-y-4", !enabled && "opacity-60")}>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mode de réception</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(notificationDeliveryModeLabels) as NotificationDeliveryMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    disabled={updateMutation.isPending}
                    onClick={() => changeMode(m)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      mode === m ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-muted/40"
                    )}
                  >
                    {notificationDeliveryModeLabels[m]}
                  </button>
                ))}
              </div>
            </div>

            {mode === "scheduled" && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Jours de réception</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {NOTIFICATION_WEEKDAYS.map((d) => {
                      const active = days.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          title={d.full}
                          aria-pressed={active}
                          disabled={updateMutation.isPending}
                          onClick={() => toggleDay(d.value)}
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-muted/40"
                          )}
                        >
                          {d.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`start-${preference.category}`} className="text-xs text-muted-foreground">
                      De
                    </Label>
                    <Input
                      id={`start-${preference.category}`}
                      type="time"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`end-${preference.category}`} className="text-xs text-muted-foreground">
                      À
                    </Label>
                    <Input
                      id={`end-${preference.category}`}
                      type="time"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {!locked && (
          <div className="flex justify-end">
            <Button size="sm" disabled={!isDirty || updateMutation.isPending} onClick={handleSave}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Enregistrer
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}