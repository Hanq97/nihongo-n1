import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  elev?: boolean;
}

export function Card({ className, accent, elev, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-2xl",
        elev ? "shadow-elev" : "shadow-card",
        accent && "border-l-[3px] border-l-accent",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
