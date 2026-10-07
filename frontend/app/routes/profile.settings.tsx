import type { Route } from "./+types/profile.settings";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import Layout from "~/components/Layout";
import ProfileSidebar from "~/components/ProfileSidebar";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import SectionTitle from "~/components/ui/SectionTitle";
import AvatarModal from "~/components/modals/AvatarModal";
import LogoutModal from "~/components/modals/LogoutModal";
import { useAuth } from "~/hooks/useAuth";
import { useCart } from "~/hooks/useCart";
import type { ProfileFormValues, User } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Настройки профиля — Noir Bijoux" }];
}

function ProfileForm({ user, onSave }: { user: User; onSave: (values: ProfileFormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone ?? "",
      email: user.email,
    },
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSave)}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Имя"
          error={errors.fullName?.message}
          {...register("fullName", { required: "Укажите имя" })}
        />
        <Input
          label="Телефон"
          error={errors.phone?.message}
          {...register("phone", {
            pattern: { value: /^[\d+()\s-]*$/, message: "Только цифры и символы + ( ) -" },
          })}
        />
      </div>

      <Input
        label="E-mail"
        type="email"
        error={errors.email?.message}
        {...register("email", {
          required: "Укажите e-mail",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты" },
        })}
      />

      <Button type="submit">Сохранить</Button>
    </form>
  );
}

export default function ProfileSettingsPage() {
  const { user, ready, updateProfile, logout } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <Layout>
      <SectionTitle title="Личный кабинет" />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProfileSidebar />

        <div className="rounded-2xl border border-brand-plum bg-brand-purple/40 p-6">
          <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-dashed border-brand-plum pb-8">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-brand-mauve bg-brand-plum text-3xl text-brand-mauve">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Аватар" className="h-full w-full object-cover" />
              ) : (
                (user?.fullName?.[0] ?? "𝒩").toUpperCase()
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setAvatarOpen(true)} disabled={!user}>
                Сменить фото
              </Button>
              <Button variant="ghost" onClick={() => setLogoutOpen(true)} disabled={!user}>
                Выйти из аккаунта
              </Button>
            </div>
          </div>

          {!ready ? (
            <p className="text-lg text-brand-mauve">Загружаем данные профиля…</p>
          ) : !user ? (
            <p className="text-lg text-brand-mauve">
              Вы не авторизованы.{" "}
              <Link to="/login" className="text-brand-white hover:text-brand-mauve">
                Войти
              </Link>{" "}
              или{" "}
              <Link to="/register" className="text-brand-white hover:text-brand-mauve">
                зарегистрироваться
              </Link>
              .
            </p>
          ) : (
            <ProfileForm
              user={user}
              onSave={(values) => {
                updateProfile(values);
                showToast("Данные профиля сохранены");
              }}
            />
          )}
        </div>
      </div>

      <AvatarModal
        isOpen={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onSave={(dataUrl) => {
          updateProfile({ avatarUrl: dataUrl });
          showToast("Фото профиля обновлено");
        }}
      />

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          logout();
          showToast("Вы вышли из аккаунта");
          navigate("/");
        }}
      />
    </Layout>
  );
}
