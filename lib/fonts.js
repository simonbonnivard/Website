import localFont from "next/font/local";

export const dinot = localFont({
  src: [
    { path: "../public/DINOT.woff2", weight: "400", style: "normal" },
    { path: "../public/DINOT-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dinot",
  display: "swap",
});
