import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type AddItemPayload = Omit<CartItem, "quantity"> & {
  // Quantidade opcional para permitir addItem simples (default = 1).
  quantity?: number;
};

type ItemIdPayload = {
  id: string;
};

const initialState: CartState = {
  items: [],
};

function normalizeQuantity(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  // Normaliza para inteiro >= 1 para manter invariantes do carrinho.
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.floor(num);
}

function normalizePrice(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  // Rejeita preço inválido; null sinaliza item não confiável para o estado.
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function sanitizeItems(input: unknown): CartItem[] {
  // Hidratação aceita payload desconhecido (ex.: localStorage) e filtra dados inválidos.
  if (!Array.isArray(input)) return [];

  return input.reduce<CartItem[]>((acc, raw) => {
    if (typeof raw !== "object" || raw === null) return acc;
    const item = raw as Record<string, unknown>;

    const id = normalizeText(item.id).trim();
    const price = normalizePrice(item.price);
    if (!id || price === null) return acc;

    acc.push({
      id,
      name: normalizeText(item.name),
      description: normalizeText(item.description),
      image: normalizeText(item.image),
      price,
      quantity: normalizeQuantity(item.quantity),
    });

    return acc;
  }, []);
}
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const { id, name, description, price, image } = action.payload;

      const normalizedId = normalizeText(id).trim();
      const normalizedPrice = normalizePrice(price);
      const quantityToAdd = normalizeQuantity(action.payload.quantity);

      // Se id/preço vier inválido, ignora a ação
      if (!normalizedId || normalizedPrice === null) return;

      const existing = state.items.find((item) => item.id === normalizedId);

      if (existing) {
        // Mesmo id representa o mesmo item no carrinho; acumula quantidade.
        existing.quantity += quantityToAdd;
        return;
      }

      state.items.push({
        id: normalizedId,
        name: normalizeText(name),
        description: normalizeText(description),
        price: normalizedPrice,
        image: normalizeText(image),
        quantity: quantityToAdd,
      });
    },

    removeItem: (state, action: PayloadAction<ItemIdPayload>) => {
      const normalizedId = normalizeText(action.payload.id).trim();
      if (!normalizedId) return;

      state.items = state.items.filter((item) => item.id !== normalizedId);
    },

    increaseQuantity: (state, action: PayloadAction<ItemIdPayload>) => {
      const normalizedId = normalizeText(action.payload.id).trim();
      if (!normalizedId) return;

      const target = state.items.find((item) => item.id === normalizedId);
      if (!target) return;
      target.quantity += 1;
    },

    decreaseQuantity: (state, action: PayloadAction<ItemIdPayload>) => {
      const normalizedId = normalizeText(action.payload.id).trim();
      if (!normalizedId) return;

      const target = state.items.find((item) => item.id === normalizedId);
      if (!target) return;

      if (target.quantity <= 1) {
        // Ao chegar em 1, decrementar remove o item para evitar quantity 0.
        state.items = state.items.filter((item) => item.id !== normalizedId);
        return;
      }

      target.quantity -= 1;
    },

    clearCart: (state) => {
      state.items = [];
    },

    hydrateCart: (state, action: PayloadAction<unknown>) => {
      // Substitui o estado por uma versão sanitizada da fonte persistida.
      state.items = sanitizeItems(action.payload);
    },
  },
});

export const { addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, hydrateCart } =
  cartSlice.actions;

export const cartReducer = cartSlice.reducer;
