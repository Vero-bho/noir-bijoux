import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("catalog", "routes/catalog.tsx"),
  route("product/:slug", "routes/product.$slug.tsx"),
  route("about", "routes/about.tsx"),
  route("cart", "routes/cart.tsx"),
  route("checkout", "routes/checkout.tsx"),

  route("constructor", "routes/constructor.tsx"),
  route("constructor/necklace", "routes/constructor.necklace.tsx"),
  route("constructor/bracelet", "routes/constructor.bracelet.tsx"),
  route("constructor/earrings", "routes/constructor.earrings.tsx"),
  route("constructor/ring", "routes/constructor.ring.tsx"),

  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  route("profile/history", "routes/profile.history.tsx"),
  route("profile/favorites", "routes/profile.favorites.tsx"),
  route("profile/settings", "routes/profile.settings.tsx"),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
