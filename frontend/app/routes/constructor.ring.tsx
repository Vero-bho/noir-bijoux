import type { Route } from "./+types/constructor.ring";

import ConstructorPage from "~/components/ConstructorPage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Конструктор — Noir Bijoux" }];
}

export default function ConstructorRingRoute() {
  return <ConstructorPage slug="ring" />;
}
