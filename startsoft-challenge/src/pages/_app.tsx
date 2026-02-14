import "@/styles/globals.scss";
import { Poppins } from "next/font/google";
import type { AppProps } from "next/app";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  );
}
