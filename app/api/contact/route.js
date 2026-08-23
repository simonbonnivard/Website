import { Resend } from "resend";
import { z } from "zod";
import { getServerEnv } from "@/lib/env.server";

export const runtime = "nodejs";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
  vehicleType: z.string().trim().min(1).max(60),
  need: z.string().trim().min(1).max(60),
  message: z.string().trim().max(2000).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
  startedAt: z.number().optional(),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_FILL_TIME_MS = 2500;

// Mémoire volatile du process : suffisant pour un site à faible volume sur
// une seule instance. Ne survit pas à un redémarrage ni à un déploiement
// multi-instances (serverless) ; à remplacer par un store partagé si le
// trafic ou le nombre d'instances augmente.
const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Trop de demandes envoyées, merci de réessayer plus tard." },
      { status: 429 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Certains champs sont invalides ou manquants." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Piège à robots : le champ honeypot n'est jamais rempli par un humain.
  if (data.website) {
    return Response.json({ ok: true });
  }

  // Anti-spam de timing : un envoi trop rapide après l'affichage du
  // formulaire trahit un remplissage automatisé.
  if (data.startedAt && Date.now() - data.startedAt < MIN_FILL_TIME_MS) {
    return Response.json({ ok: true });
  }

  let env;
  try {
    env = getServerEnv();
  } catch (error) {
    console.error("[contact] Configuration serveur invalide :", error);
    return Response.json(
      { error: "Le formulaire est momentanément indisponible." },
      { status: 500 }
    );
  }

  const resend = new Resend(env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: `ONE BATT <${env.CONTACT_EMAIL_FROM}>`,
      to: env.CONTACT_EMAIL_TO,
      replyTo: data.email,
      subject: `Nouvelle demande de contact : ${data.firstName} ${data.lastName}`,
      text: [
        `Prénom : ${data.firstName}`,
        `Nom : ${data.lastName}`,
        `Email : ${data.email}`,
        `Téléphone : ${data.phone}`,
        `Type de véhicule : ${data.vehicleType}`,
        `Besoin : ${data.need}`,
        "",
        "Message :",
        data.message || "(aucun message)",
      ].join("\n"),
    });
  } catch (error) {
    console.error("[contact] Échec de l'envoi de l'email :", error);
    return Response.json(
      { error: "L'envoi a échoué, merci de réessayer ou de nous appeler." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
