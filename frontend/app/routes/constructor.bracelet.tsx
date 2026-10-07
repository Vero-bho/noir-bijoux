import type { Route } from "./+types/constructor.bracelet";

import ConstructorPage from "~/components/ConstructorPage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Конструктор — Noir Bijoux" }];
}

export default function ConstructorBraceletRoute() {
  return <ConstructorPage slug="bracelet" />;
}
