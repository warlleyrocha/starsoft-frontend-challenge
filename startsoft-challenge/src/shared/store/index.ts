import { configureStore } from "@reduxjs/toolkit";
import { cartReducer } from "@/features/cart/store/cartSlice";

export const store = configureStore({
  reducer: {
    // Cada feature registra seu reducer raiz aqui.
    cart: cartReducer,
  },
});

// Tipo do estado global inferido automaticamente a partir da store.
export type RootState = ReturnType<typeof store.getState>;
// Tipo do dispatch tipado para uso nos hooks utilitários.
export type AppDispatch = typeof store.dispatch;
