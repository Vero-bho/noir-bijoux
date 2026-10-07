import type { Route } from "./+types/constructor.necklace";

import ConstructorPage from "~/components/ConstructorPage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Конструктор — Noir Bijoux" }];
}

export default function ConstructorNecklaceRoute() {
  return <ConstructorPage slug="necklace" />;
}
