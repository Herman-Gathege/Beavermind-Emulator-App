import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tabsVariants = cva("inline-flex items-center justify-center rounded-md p-1 text-muted-foreground");

interface TabsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn(tabsVariants(), className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

function TabsList({ className, ...props }: TabsListProps) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-2", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
