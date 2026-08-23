import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY est requis"),
  CONTACT_EMAIL_TO: z.string().email("CONTACT_EMAIL_TO doit être un email valide"),
  CONTACT_EMAIL_FROM: z
    .string()
    .email("CONTACT_EMAIL_FROM doit être un email valide")
    .default("onboarding@resend.dev"),
});

let cachedEnv;

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
    CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(" | ");
    throw new Error(`Variables d'environnement invalides : ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
