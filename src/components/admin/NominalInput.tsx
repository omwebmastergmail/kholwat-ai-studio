import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  value: number;
  onChange: (val: number) => void;
}

export const NominalInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, className, ...rest }, ref) => {
    const display =
      value > 0 || value < 0 ? new Intl.NumberFormat("id-ID").format(value) : value === 0 ? "" : "";
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits === "" ? 0 : Number(digits));
        }}
        className={cn("tabular-nums", className)}
        {...rest}
      />
    );
  },
);
NominalInput.displayName = "NominalInput";
