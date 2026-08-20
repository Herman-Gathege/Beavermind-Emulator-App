import * as React from "react";
import { Toast } from "@/components/ui/toast";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, title, description, variant } as Toast;
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return { toasts, addToast };
}
