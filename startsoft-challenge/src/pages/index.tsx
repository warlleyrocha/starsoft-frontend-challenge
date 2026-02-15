import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";

import { LoadMore } from "@/features/nfts/components/LoadMore";

export default function Home() {
  return (
    <>
      <Header cartCount={2} />

      <main>
        <LoadMore />
      </main>

      <Footer />
    </>
  );
}
