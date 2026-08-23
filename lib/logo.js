/**
 * Le logo est imprimé sur le manchon de la cellule. On le décode en
 * ImageBitmap : c'est la seule image manipulable dans un worker, et le
 * décodage se fait de toute façon hors du thread principal.
 *
 * Un échec n'est pas bloquant — le manchon reste vierge, la scène tourne.
 */
export async function loadLogo() {
  try {
    const res = await fetch("/onebatt_logo.png");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await createImageBitmap(await res.blob());
  } catch (err) {
    console.warn("[OneBatt] Logo introuvable : le manchon restera vierge.", err);
    return null;
  }
}
