import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn(textareaVariants(), className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";

export { Textarea };
