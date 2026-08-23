import { headers } from "next/headers";
import "./globals.css";
import SiteClient from "@/components/site-client";
import { dinot } from "@/lib/fonts";

export const metadata = {
  metadataBase: new URL("https://www.onebatt.fr"),
  title:
    "OneBatt · Diagnostic & vente de batteries à Béziers | Atelier · Batteries · Services",
  description:
    "OneBatt, atelier et magasin de batteries à Villeneuve-lès-Béziers (Béziers). Diagnostic avant remplacement, toutes technologies, tous véhicules : auto, moto, utilitaire, camping-car, bateau, golfette, PMR, lithium, solaire.",
  keywords: [
    "batterie Béziers",
    "diagnostic batterie",
    "batterie camping-car",
    "énergie embarquée",
    "OneBatt",
    "Villeneuve-lès-Béziers",
  ],
  authors: [{ name: "ONE BATT" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ONE BATT",
    title: "ONE BATT · Diagnostic & vente de batteries à Béziers",
    description:
      "Diagnostic avant remplacement, toutes technologies, tous véhicules. Atelier et magasin à Béziers.",
    images: [{ url: "/onebatt_logo_nav.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ONE BATT · Diagnostic & vente de batteries à Béziers",
    description:
      "Diagnostic avant remplacement, toutes technologies, tous véhicules. Atelier et magasin à Béziers.",
    images: ["/onebatt_logo_nav.png"],
  },
  other: {
    "geo.region": "FR-34",
    "geo.placename": "Béziers",
  },
};

export const viewport = {
  themeColor: "#050506",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "ONE BATT",
  description: "Diagnostic et vente de batteries pour tous véhicules à Béziers.",
  url: "https://www.onebatt.fr/",
  telephone: "+33467000000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 avenue du Romain",
    addressLocality: "Villeneuve-lès-Béziers",
    postalCode: "34420",
    addressRegion: "Occitanie",
    addressCountry: "FR",
  },
  areaServed: "Béziers et région",
  priceRange: "€€",
};

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="fr" className={dinot.variable}>
      <head>
        <link rel="icon" href="/onebatt_logo_nav.png" type="image/png" />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <SiteClient />
      </body>
    </html>
  );
}
