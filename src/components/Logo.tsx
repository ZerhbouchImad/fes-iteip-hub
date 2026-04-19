import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft transition-bounce group-hover:scale-105 group-hover:shadow-glow">
        <GraduationCap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight">ITEIP</span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Fès</span>
      </div>
    </Link>
  );
}
