// Minimal text sanitization for free-form fields. We *never* render strings
// as raw HTML (React escapes by default), but we still scrub control chars and
// cap whitespace so adversaries can't pad payloads to break layouts.

const ZERO_WIDTH = /[​-‏‪-‮﻿]/g;
const CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g; // keep \t \n \r

export function cleanText(input: string, max = 2000): string {
  return input
    .replace(ZERO_WIDTH, "")
    .replace(CONTROL, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, max)
    .trim();
}

// Listing summary serializer — strips sensitive owner fields for the public feed.
export function listingPublic<T extends {
  id: string;
  kind: string;
  title: string;
  description: string;
  category: string;
  campus: string;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  happenedAt: Date;
  handover: string;
  status: string;
  createdAt: Date;
  photos?: { id: string; data: string; tone: string | null }[];
}>(l: T) {
  return {
    id: l.id,
    kind: l.kind,
    title: l.title,
    description: l.description,
    category: l.category,
    campus: l.campus,
    locationName: l.locationName,
    locationLat: l.locationLat,
    locationLng: l.locationLng,
    happenedAt: l.happenedAt.toISOString(),
    handover: l.handover,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    photos: (l.photos || []).map((p) => ({ id: p.id, data: p.data, tone: p.tone })),
  };
}
