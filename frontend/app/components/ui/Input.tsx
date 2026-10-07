// Поле ввода с подписью и сообщением об ошибке.
// Работает и с обычным useState, и с react-hook-form (через {...register("field")}).
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="block" htmlFor={inputId}>
        {label && <span className="mb-2 block text-lg text-brand-mauve">{label}</span>}

        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-xl border bg-brand-bg/60 px-4 py-3 text-lg text-brand-white",
            "placeholder:text-brand-mauve/50 focus:outline-none",
            error ? "border-red-400" : "border-brand-plum focus:border-brand-mauve",
            className,
          ].join(" ")}
          {...props}
        />

        {hint && !error && <span className="mt-1 block text-sm text-brand-mauve/70">{hint}</span>}
        {error && <span className="mt-1 block text-sm text-red-300">{error}</span>}
      </label>
    );
  },
);

Input.displayName = "Input";

export default Input;
