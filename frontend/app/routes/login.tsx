import type { Route } from "./+types/login";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { DEMO_CREDENTIALS, useAuth } from "~/hooks/useAuth";
import { useCart } from "~/hooks/useCart";
import type { LoginFormValues } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Вход — Noir Bijoux" }];
}

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password },
  });

  const submit = (values: LoginFormValues) => {
    const result = login(values);
    if (!result.ok) {
      setError("password", { message: result.message ?? "Не удалось войти" });
      return;
    }
    showToast("Вы вошли в аккаунт");
    navigate("/profile/history");
  };

  return (
    <div className="grid min-h-[calc(100vh-160px)] lg:grid-cols-2">
      <div className="hidden flex-col justify-center gap-6 border-r border-brand-plum bg-brand-purple/40 p-14 lg:flex">
        <p className="text-8xl leading-none text-brand-mauve">𝒩</p>
        <p className="text-3xl text-brand-white">Noir Bijoux</p>
        <p className="text-2xl text-brand-mauve">Искусство создания уникальных украшений</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-normal">С возвращением</h1>
          <p className="mt-3 mb-10 text-lg text-brand-mauve">Войдите, чтобы продолжить работу</p>

          <form className="space-y-6" onSubmit={handleSubmit(submit)}>
            <Input
              label="E-mail"
              type="email"
              placeholder="olga@mail.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Укажите e-mail",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты" },
              })}
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password", {
                required: "Введите пароль",
                minLength: { value: 4, message: "Минимум 4 символа" },
              })}
            />

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              Войти
            </Button>
          </form>

          <p className="mt-8 text-center text-lg text-brand-mauve">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-brand-white hover:text-brand-mauve">
              Регистрация
            </Link>
          </p>

          <p className="mt-6 rounded-xl border border-brand-plum p-4 text-center text-sm text-brand-mauve/80">
            Демо-доступ: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            <br />
            После подключения бэкенда (шаг 4) вход выполняется через POST /api/auth/login.
          </p>
        </div>
      </div>
    </div>
  );
}
