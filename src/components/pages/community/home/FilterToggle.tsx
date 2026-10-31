import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FilterToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FilterToggle({ id, label, checked, onChange }: FilterToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </Label>
    </div>
  );
}