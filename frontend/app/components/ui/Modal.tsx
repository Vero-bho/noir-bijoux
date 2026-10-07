// Модальное окно (занятие 10). Закрывается по кнопке ×, клику по фону и Escape.
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** ширина окна */
  size?: "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-brand-mauve",
          "bg-brand-purple p-8 shadow-2xl",
          size === "lg" ? "max-w-3xl" : "max-w-xl",
        ].join(" ")}
      >
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-brand-plum pb-4">
          <h2 className="text-3xl text-brand-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-3xl text-brand-mauve transition-colors hover:text-brand-white"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
