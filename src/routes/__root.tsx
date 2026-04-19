import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-smooth hover:shadow-glow"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ITEIP Fès — Plateforme de Gestion d'École" },
      { name: "description", content: "Plateforme officielle de gestion de l'Institut ITEIP de Fès : étudiants, notes, présences, modules et filières." },
      { name: "author", content: "ITEIP Fès" },
      { property: "og:title", content: "ITEIP Fès — Plateforme de Gestion d'École" },
      { property: "og:description", content: "Plateforme officielle de gestion de l'Institut ITEIP de Fès : étudiants, notes, présences, modules et filières." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ITEIP Fès — Plateforme de Gestion d'École" },
      { name: "twitter:description", content: "Plateforme officielle de gestion de l'Institut ITEIP de Fès : étudiants, notes, présences, modules et filières." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8fb77260-cb03-41f9-8d27-22e0ebb9219d/id-preview-fcfcb840--25a930db-fa45-4e6b-8c6c-8be6dcfa4adb.lovable.app-1776562325573.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8fb77260-cb03-41f9-8d27-22e0ebb9219d/id-preview-fcfcb840--25a930db-fa45-4e6b-8c6c-8be6dcfa4adb.lovable.app-1776562325573.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
