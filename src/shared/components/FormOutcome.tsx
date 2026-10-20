import type { SubmitResult } from "../submit";
import { BrandText } from "./BrandText";

/**
 * What actually happened to a form, in plain words: the backend took it
 * (`sent`), or the details went to a Gmail draft the visitor still has to
 * send. Never a fake "done". Styles: `.form-status` in join.css.
 */
export function FormOutcome({ result, sent }: { result: SubmitResult | null; sent: string | null }) {
  if (!result) return <p className="form-status" role="status" aria-live="polite" />;
  return (
    <p className={`form-status is-${result.outcome}`} role="status" aria-live="polite">
      {result.outcome === "sent" ? (
        <BrandText text={sent ?? ""} />
      ) : (
        <>
          We&apos;ve opened an email to our team in Gmail with your details. Press send there and we&apos;ll reply. Nothing is sent until you
          do.{" "}
          <a href={result.composeUrl} target="_blank" rel="noopener noreferrer">
            Open the email again
          </a>
        </>
      )}
    </p>
  );
}
