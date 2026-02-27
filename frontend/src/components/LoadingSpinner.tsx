import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  message?: string;
  className?: string;
};

export function LoadingSpinner({ message = "Loading...", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      <span>{message}</span>
    </div>
  );
}
