import "@/styles/globals.scss";
import { Poppins } from "next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useLayoutEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { makeQueryClient } from "@/shared/lib/react-query/queryClient";
import { store } from "@/shared/store";
import { hydrateCart } from "@/features/cart/store/cartSlice";
import { loadCartItems, saveCartItems } from "@/features/cart/store/cartStorage";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => makeQueryClient());

  useIsomorphicLayoutEffect(() => {
    const persistedItems = loadCartItems();
    if (persistedItems.length > 0) {
      store.dispatch(hydrateCart(persistedItems));
    }
  }, []);

  useEffect(() => {
    let lastSerialized = JSON.stringify(store.getState().cart.items);

    const unsubscribe = store.subscribe(() => {
      const items = store.getState().cart.items;
      const nextSerialized = JSON.stringify(items);

      if (nextSerialized === lastSerialized) return;

      lastSerialized = nextSerialized;
      saveCartItems(items);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Head>
        <title>Starsoft Challenge</title>
        <meta
          name="description"
          content="Catálogo de NFTs com listagem, detalhes de itens e carrinho de compra."
          key="description"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={poppins.className}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </Provider>
      </main>
    </>
  );
}
