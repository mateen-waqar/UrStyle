import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-editorial uppercase transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default:
          "border-charcoal/20 bg-charcoal text-white",
        secondary:
          "border-border bg-atelier-200 text-charcoal",
        outline:
          "border-border text-muted-foreground bg-transparent",
        beige:
          "border-beige-300 bg-beige-100 text-charcoal",
        charcoal:
          "border-charcoal bg-charcoal text-white",
        muted:
          "border-transparent bg-atelier-200/80 text-muted-foreground",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
