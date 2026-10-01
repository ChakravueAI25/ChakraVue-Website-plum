const NAME = /(ChakraVue(?: AI)?)/;

/**
 * Text with the company name kept as written ("ChakraVue AI") even inside
 * labels the stylesheet sets in capitals (`.brand-name` in global.css).
 */
export function BrandText({ text }: { text: string }) {
  return (
    <>
      {text.split(NAME).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="brand-name">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** The same, for text set from a script (the platform screen's title). */
export function setBrandText(el: HTMLElement, text: string) {
  el.replaceChildren(
    ...text.split(NAME).map((part, i) => {
      if (i % 2 === 0) return part;
      const span = document.createElement("span");
      span.className = "brand-name";
      span.textContent = part;
      return span;
    }),
  );
}
