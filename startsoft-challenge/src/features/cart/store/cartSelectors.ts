import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/store";

// Selector base reutilizado pelos derivados de carrinho.
export const selectCartItems = (state: RootState) => state.cart.items;

// Total de unidades no carrinho (somatório de quantity), memoizado por referência da lista.
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

// Total financeiro do carrinho em ETH (price * quantity), também memoizado.
export const selectCartTotalEth = createSelector(selectCartItems, (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0),
);

// Factory de selector para buscar item por id em componentes que recebem id dinâmico.
export const selectCartItemById = (id: string) => (state: RootState) =>
  state.cart.items.find((item) => item.id === id);
