import { NextResponse } from "next/server";

/* CSP stricte à nonce : voir app/layout.jsx pour la lecture du nonce (en-tête
   x-nonce) et son application au script JSON-LD. Next.js applique lui-même ce
   nonce aux scripts qu'il génère (runtime, hydratation, chunks de page) dès
   qu'il détecte le motif 'nonce-…' dans l'en-tête Content-Security-Policy.
   Un nonce différent à chaque requête impose un rendu dynamique : les pages
   ne peuvent plus être prégénérées statiquement. */

function buildCsp(nonce) {
  const isDev = process.env.NODE_ENV !== "production";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Attribut style="" piloté en JS pour les animations (scroll, focus,
    // révélation) : les nonces ne couvrent pas les attributs style, d'où le
    // unsafe-inline ici (le script-src reste lui strict).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
