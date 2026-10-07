import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { CartItem, SavedBuild } from "~/types";
import { demoBuilds } from "~/data/demoOrders";
import { STORAGE_KEYS, readStorage, writeStorage } from "~/lib/storage";

interface BuildsContextValue {
  builds: SavedBuild[];
  ready: boolean;
  saveBuild: (build: SavedBuild) => void;
  removeBuild: (id: string) => void;
  isSaved: (article: string) => boolean;
  toCartItem: (build: SavedBuild) => Omit<CartItem, "quantity">;
}

const BuildsContext = createContext<BuildsContextValue | undefined>(undefined);

export function BuildsProvider({ children }: { children: ReactNode }) {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBuilds(readStorage<SavedBuild[]>(STORAGE_KEYS.builds, demoBuilds));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(STORAGE_KEYS.builds, builds);
  }, [builds, ready]);

  const saveBuild = useCallback((build: SavedBuild) => {
    setBuilds((prev) => [build, ...prev.filter((row) => row.id !== build.id)]);
  }, []);

  const removeBuild = useCallback((id: string) => {
    setBuilds((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const isSaved = useCallback(
    (article: string) => builds.some((row) => row.article === article),
    [builds],
  );

  const toCartItem = useCallback(
    (build: SavedBuild): Omit<CartItem, "quantity"> => ({
      key: `build-${build.article}`,
      kind: "build",
      id: Number(build.id.replace(/\D/g, "")) || Date.now(),
      name: `${build.jewelryTitle} (авторская сборка ${build.article})`,
      price: build.totalPrice,
      article: build.article,
      image: build.components.find((component) => component.image)?.image,
    }),
    [],
  );

  const value: BuildsContextValue = { builds, ready, saveBuild, removeBuild, isSaved, toCartItem };
  return <BuildsContext.Provider value={value}>{children}</BuildsContext.Provider>;
}

export function useBuilds(): BuildsContextValue {
  const context = useContext(BuildsContext);
  if (!context) {
    throw new Error("useBuilds должен использоваться внутри <BuildsProvider>");
  }
  return context;
}
