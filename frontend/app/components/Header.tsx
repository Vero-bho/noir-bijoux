import { useState } from "react";
import { Link, NavLink } from "react-router";

import { useAuth } from "~/hooks/useAuth";
import { useCart } from "~/hooks/useCart";

const NAV_ITEMS = [
  { to: "/catalog", label: "Каталог" },
  { to: "/constructor", label: "Конструктор" },
  { to: "/about", label: "О мастере" },
];

export default function Header() {
  const { user } = useAuth();
  const { count, toast } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-brand-white" : "text-brand-mauve transition-colors hover:text-brand-white";

  const firstName = user?.fullName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-plum bg-brand-purple/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="flex items-center gap-3 text-2xl tracking-widest md:text-3xl">
          <span className="text-4xl text-brand-mauve md:text-5xl">𝒩</span>
          <span className="whitespace-nowrap">Noir Bijoux</span>
        </Link>

        <nav className="hidden items-center gap-8 text-xl md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-lg md:text-xl">
          {user ? (
            <NavLink to="/profile/history" className={linkClass}>
              {firstName}
            </NavLink>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Войти
            </NavLink>
          )}

          <NavLink to="/cart" className={linkClass}>
            Корзина ({count})
          </NavLink>

          <button
            type="button"
            aria-label="Меню"
            className="text-2xl text-brand-mauve md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-brand-plum px-6 py-5 text-xl md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/profile/history" className={linkClass} onClick={() => setMenuOpen(false)}>
            Личный кабинет
          </NavLink>
        </nav>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-mauve bg-brand-plum px-6 py-4 text-lg text-brand-white shadow-2xl">
          {toast}
        </div>
      )}
    </header>
  );
}
