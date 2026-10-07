import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./hooks/useAuth";
import { BuildsProvider } from "./hooks/useBuilds";
import { CartProvider } from "./hooks/useCart";
import { OrdersProvider } from "./hooks/useOrders";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Oranienbaum&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body className="flex min-h-screen flex-col bg-brand-bg font-serif text-brand-white">
        <CartProvider>
          <AuthProvider>
            <BuildsProvider>
              <OrdersProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </OrdersProvider>
            </BuildsProvider>
          </AuthProvider>
        </CartProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Ошибка";
  let details = "Произошла непредвиденная ошибка.";

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "404" : `Ошибка ${error.status}`;
    details = error.status === 404 ? "Страница не найдена." : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-4 text-5xl text-brand-mauve">{title}</h1>
      <p className="text-xl text-brand-mauve/80">{details}</p>
    </main>
  );
}
