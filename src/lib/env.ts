// Centralised environment-variable parsing. Throws at boot if anything required
// is missing so a misconfigured deploy fails loud, not silently.

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var ${name}`);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] && process.env[name]!.length > 0
    ? (process.env[name] as string)
    : fallback;
}

function parseList(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/^@/, "").replace(/^\./, ""))
    .filter(Boolean);
}

export const env = {
  AUTH_SECRET: required("AUTH_SECRET"),
  SESSION_COOKIE: optional("SESSION_COOKIE", "cf_session"),
  SESSION_MAX_AGE: parseInt(optional("SESSION_MAX_AGE", "604800"), 10),
  ALLOWED_EMAIL_DOMAINS: parseList(optional("ALLOWED_EMAIL_DOMAINS", "igdtuw.ac.in,iiitd.ac.in")),
  ADMIN_EMAILS: parseList(optional("ADMIN_EMAILS", "")),
  OTP_TTL_SECONDS: parseInt(optional("OTP_TTL_SECONDS", "300"), 10),
  OTP_MAX_ATTEMPTS: parseInt(optional("OTP_MAX_ATTEMPTS", "5"), 10),
  OTP_DEV_ECHO:
    optional("OTP_DEV_ECHO", "false").toLowerCase() === "true" &&
    process.env.NODE_ENV !== "production",
  APP_URL: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  IS_PROD: process.env.NODE_ENV === "production",
};

if (env.AUTH_SECRET.length < 32) {
  throw new Error("AUTH_SECRET must be at least 32 characters");
}
