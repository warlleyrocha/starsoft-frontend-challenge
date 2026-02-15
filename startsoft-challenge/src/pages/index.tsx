import { useState } from "react";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";

import { OverlayCheckout } from "@/features/cart/components/OverlayCheckout";
import { LoadMore } from "@/features/nfts/components/LoadMore";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header cartCount={2} onCartButtonClick={() => setIsCartOpen(true)} />

      <main>
        <LoadMore />
      </main>

      <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </>
  );
}
