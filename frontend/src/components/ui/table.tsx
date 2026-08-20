import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={cn("border-t bg-muted/50 font-medium [&_tr]:last:border-b-0", className)} {...props} />
  );
}

function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />;
}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn("p-2 align-middle", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };
