import type { CartItem } from "./cartSlice";

// Versão da chave para permitir migrações futuras de formato sem conflito.
const CART_STORAGE_KEY = "starsoft_cart_v1";

type CartStorageShape = {
  items: CartItem[];
};

export function loadCartItems(): unknown[] {
  if (typeof globalThis === "undefined") return [];

  try {
    const raw = globalThis.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [];

    const data = parsed as Record<string, unknown>;
    if (!Array.isArray(data.items)) return [];

    // Retorna payload bruto; a sanitização final acontece no hydrateCart.
    return data.items;
  } catch {
    // Leitura deve ser fail-safe para não quebrar renderização.
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof globalThis === "undefined") return;

  try {
    const payload: CartStorageShape = { items };
    globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignora falhas de persistência (ex.: quota excedida / modo privado).
  }
}
