import type { ExtractedDocument, RateTablePackage } from "../types";

export async function extractRateTables(documents: ExtractedDocument[], signal?: AbortSignal) {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents }),
    signal,
  });
  if (response.ok) return await response.json() as RateTablePackage;
  let message = `Extraction failed (${response.status}).`;
  try {
    const body = await response.json() as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // The status-derived fallback remains useful for a non-JSON response.
  }
  throw new Error(message);
}
