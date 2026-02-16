import "@/styles/globals.scss";
import { Poppins } from "next/font/google";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/shared/lib/react-query/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <main className={poppins.className}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </main>
  );
}
