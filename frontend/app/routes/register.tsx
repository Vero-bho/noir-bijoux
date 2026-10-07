import type { Route } from "./+types/register";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { useAuth } from "~/hooks/useAuth";
import { useCart } from "~/hooks/useCart";
import type { RegisterFormValues } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Регистрация — Noir Bijoux" }];
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const submit = (values: RegisterFormValues) => {
    registerUser(values);
    showToast("Аккаунт создан");
    navigate("/profile/history");
  };

  return (
    <div className="grid min-h-[calc(100vh-160px)] lg:grid-cols-2">
      <div className="hidden flex-col justify-center gap-6 border-r border-brand-plum bg-brand-purple/40 p-14 lg:flex">
        <p className="text-8xl leading-none text-brand-mauve">𝒩</p>
        <p className="text-3xl text-brand-white">Noir Bijoux</p>
        <p className="text-2xl text-brand-mauve">
          Сохраняйте сборки, следите за заказами и получайте доступ к закрытым коллекциям
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-normal">Создать аккаунт</h1>
          <p className="mt-3 mb-10 text-lg text-brand-mauve">Заполните данные — это займёт минуту</p>

          <form className="space-y-6" onSubmit={handleSubmit(submit)}>
            <Input
              label="Имя и фамилия"
              placeholder="Ольга Иванова"
              error={errors.fullName?.message}
              {...register("fullName", {
                required: "Укажите имя",
                minLength: { value: 2, message: "Слишком короткое имя" },
              })}
            />

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
              label="Телефон"
              placeholder="+7 (999) 000-00-00"
              error={errors.phone?.message}
              {...register("phone", {
                required: "Укажите телефон",
                pattern: { value: /^[\d+()\s-]{10,18}$/, message: "Телефон в формате +7 (999) 000-00-00" },
              })}
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="Минимум 6 символов"
              error={errors.password?.message}
              {...register("password", {
                required: "Придумайте пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
            />

            <Input
              label="Повторите пароль"
              type="password"
              placeholder="Повторите пароль"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Повторите пароль",
                validate: (value) => value === password || "Пароли не совпадают",
              })}
            />

            <Button type="submit" fullWidth size="lg">
              Зарегистрироваться
            </Button>
          </form>

          <p className="mt-8 text-center text-lg text-brand-mauve">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-brand-white hover:text-brand-mauve">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
