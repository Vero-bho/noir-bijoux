import type { Route } from "./+types/constructor.earrings";

import ConstructorPage from "~/components/ConstructorPage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Конструктор — Noir Bijoux" }];
}

export default function ConstructorEarringsRoute() {
  return <ConstructorPage slug="earrings" />;
}
