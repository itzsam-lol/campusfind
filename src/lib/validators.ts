// Shared zod schemas + helpers used by both API routes and forms.
import { z } from "zod";
import { env } from "./env";

const KNOWN_CAMPUSES = ["IGDTUW", "IIIT Delhi"] as const;

export const campusEnum = z.enum(KNOWN_CAMPUSES);
export const categoryEnum = z.enum([
  "electronics",
  "documents",
  "keys",
  "clothing",
  "accessories",
  "other",
]);
export const handoverEnum = z.enum(["desk", "keep"]);
export const listingKindEnum = z.enum(["found", "lost"]);
export const claimStatusEnum = z.enum(["pending", "approved", "rejected", "returned"]);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(254)
  .refine(
    (v) => {
      const domain = v.split("@")[1] || "";
      return env.ALLOWED_EMAIL_DOMAINS.some(
        (d) => domain === d || domain.endsWith(`.${d}`),
      );
    },
    {
      message: `Use a college email (${env.ALLOWED_EMAIL_DOMAINS.join(", ")})`,
    },
  );

export const requestOtpSchema = z.object({
  email: emailSchema,
  campus: campusEnum,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const createListingSchema = z.object({
  kind: listingKindEnum,
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: categoryEnum,
  locationName: z.string().trim().min(2).max(120),
  locationLat: z.number().gte(-90).lte(90).optional(),
  locationLng: z.number().gte(-180).lte(180).optional(),
  happenedAt: z.coerce.date(),
  handover: handoverEnum,
  photos: z
    .array(
      z.object({
        // data URL up to ~1.5MB after base64 expansion
        data: z
          .string()
          .max(2_200_000)
          .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Bad image format"),
        tone: z.string().max(16).optional(),
      }),
    )
    .max(4)
    .default([]),
});

export const createClaimSchema = z.object({
  description: z
    .string()
    .trim()
    .min(20, "Add at least 20 characters of detail")
    .max(2000),
});

export const decideClaimSchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(2000),
  audience: z.enum(["all", "students"]).default("all"),
  scheduledAt: z.coerce.date().optional(),
});

export const listingsQuerySchema = z.object({
  kind: listingKindEnum.optional(),
  category: categoryEnum.optional(),
  campus: campusEnum.optional(),
  q: z.string().trim().max(120).optional(),
  status: z.enum(["open", "claimed", "returned", "closed", "any"]).default("any"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
