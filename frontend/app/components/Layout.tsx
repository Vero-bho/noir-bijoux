import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = "" }: LayoutProps) {
  return <div className={["mx-auto w-full max-w-7xl px-6 py-12", className].join(" ")}>{children}</div>;
}
