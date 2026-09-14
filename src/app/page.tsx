import { About } from "@/components/site/about";
import { Achievements } from "@/components/site/achievements";
import { CtaBanner } from "@/components/site/cta-banner";
import { Deals } from "@/components/site/deals";
import { Destinations } from "@/components/site/destinations";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { Manifesto } from "@/components/site/manifesto";
import { Testimonials } from "@/components/site/testimonials";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Achievements />
      <Deals />
      <Destinations />
      <About />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  );
}
