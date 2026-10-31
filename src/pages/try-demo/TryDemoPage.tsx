import { useCallback, useState } from "react";
import { usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { audiences } from "../../shared/data/audiences";
import { DemoCards } from "./components/DemoCards";
import { DemoHero } from "./components/DemoHero";
import { DemoRequest } from "./components/DemoRequest";
import { RolePicker } from "./components/RolePicker";
import { goTo, type DemoChoice } from "./demo";
import "./try-demo.css";

/**
 * Try Demo (/try-demo): who are you, then the products built for you, each
 * with its declared demo allocation and its own "Try Demo" button. The
 * products and audiences come from shared/data/audiences.ts.
 *
 * There's no demo environment or point accounting behind the page yet, so
 * "Try Demo" opens a request form (DemoRequest) for that one product.
 */
export function TryDemoPage() {
  usePageMotion();
  const [selected, setSelected] = useState<string | null>(null);
  // A link can open one product's request straight away (`/try-demo?demo=surgical-assistant`).
  const [choice, setChoice] = useState<DemoChoice | null>(() => {
    const key = new URLSearchParams(window.location.search).get("demo");
    for (const audience of audiences) {
      const item = audience.items.find((i) => i.key === key);
      if (item) return { item, audience };
    }
    return null;
  });

  const pick = useCallback((id: string | null, scroll: boolean) => {
    setSelected(id);
    if (scroll) goTo("demos");
  }, []);

  return (
    <main className="site-shell demo-page">
      <Header />
      <DemoHero />
      <RolePicker selected={selected} onPick={(id) => pick(id, true)} />
      <DemoCards selected={selected} onFilter={(id) => pick(id, false)} onTry={setChoice} />
      <DemoRequest choice={choice} onClose={() => setChoice(null)} />
    </main>
  );
}
