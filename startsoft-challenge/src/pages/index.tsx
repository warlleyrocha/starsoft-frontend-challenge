import { useState } from "react";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";

import { OverlayCheckout } from "@/features/cart/components/OverlayCheckout";
import { LoadMore } from "@/features/nfts/components/LoadMore";
import { List } from "@/features/nfts/components/List";

import { NFTs } from "@/constants/nfts";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header cartCount={2} onCartButtonClick={() => setIsCartOpen(true)} />

      <main className="container">
        <List items={NFTs} />
        <LoadMore />
      </main>

      <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </>
  );
}
