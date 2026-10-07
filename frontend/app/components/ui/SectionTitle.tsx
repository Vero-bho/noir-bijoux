// Заголовок раздела с необязательным подзаголовком
import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  /** h1 для страниц, h2 для блоков */
  as?: "h1" | "h2";
  children?: ReactNode;
}

export default function SectionTitle({ title, subtitle, as = "h1", children }: SectionTitleProps) {
  const Heading = as;

  return (
    <div className="mb-8">
      <Heading className="text-4xl font-normal text-brand-mauve md:text-5xl">{title}</Heading>
      {subtitle && <p className="mt-3 text-xl text-brand-mauve/80">{subtitle}</p>}
      {children}
    </div>
  );
}
