import Script from "next/script";
import { analytics } from "@/lib/site";

/** Google Analytics 4 (gtag.js) — migrated from the legacy mkdocs.yml. */
export function Analytics() {
  if (!analytics.gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${analytics.gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${analytics.gaId}');`}
      </Script>
    </>
  );
}
