// Arquivo de configuração da store do Redux, utilizando o Redux Toolkit para simplificar a criação da store e dos reducers. Aqui, estamos importando o reducer do carrinho de compras e adicionando-o à configuração da store. Também definimos os tipos RootState e AppDispatch para facilitar o uso do estado e das ações em toda a aplicação.

import { configureStore } from "@reduxjs/toolkit";
import { cartReducer } from "@/features/cart/store/cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
