import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "destructive" && "border-destructive/50 text-destructive dark:border-destructive",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
