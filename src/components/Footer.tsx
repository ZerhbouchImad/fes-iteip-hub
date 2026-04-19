import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Institut de Technologie, d'Économie, d'Informatique et de Polyvalence — Fès, Maroc.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">Plateforme</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/filieres" className="hover:text-foreground transition-smooth">Filières</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-smooth">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-smooth">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Fès, Maroc</li>
              <li>contact@iteip.ma</li>
              <li>+212 5 35 00 00 00</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ITEIP Fès. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
