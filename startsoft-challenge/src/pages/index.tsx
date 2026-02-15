import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";

export default function Home() {
  return (
    <>
      <Header cartCount={2} />
      <main></main>
      <Footer />
    </>
  );
}
