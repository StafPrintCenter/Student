import { cn } from "@/lib/utils";
import { COMMUNITY_REPORT_REASONS, communityReportReasonMap, type CommunityReportReason } from "@/data/community";

interface ReportReasonOptionsProps {
  value: CommunityReportReason | "";
  onChange: (reason: CommunityReportReason) => void;
  disabled?: boolean;
}

export function ReportReasonOptions({ value, onChange, disabled }: ReportReasonOptionsProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Motif du signalement</legend>
      {COMMUNITY_REPORT_REASONS.map((reason) => {
        const { label, description } = communityReportReasonMap[reason];
        const checked = value === reason;
        return (
          <label
            key={reason}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/40",
              checked ? "border-primary bg-primary/5" : "border-border",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input
              type="radio"
              name="report-reason"
              value={reason}
              checked={checked}
              onChange={() => onChange(reason)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="space-y-0.5">
              <span className="block font-medium">{label}</span>
              <span className="block text-xs text-muted-foreground">{description}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}