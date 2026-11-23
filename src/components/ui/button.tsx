import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal text-white hover:bg-charcoal-50 shadow-subtle border border-charcoal/90",
        secondary:
          "bg-atelier-200 text-charcoal hover:bg-atelier-300 border border-border/80 shadow-subtle",
        outline:
          "border border-border bg-card/60 hover:bg-atelier-200 hover:text-charcoal hover:border-charcoal/30 shadow-subtle",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-atelier-200/80",
        link:
          "text-foreground underline-offset-4 hover:underline p-0 h-auto font-normal",
        beige:
          "bg-beige-200 text-charcoal hover:bg-beige-300 border border-beige-300 shadow-subtle font-medium",
        subtleBlack:
          "bg-charcoal text-white hover:bg-black border border-black shadow-subtle",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-subtle",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-[11px]",
        lg: "h-11 rounded-md px-6 text-sm tracking-wider uppercase",
        icon: "h-9 w-9 p-0",
        iconSm: "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
