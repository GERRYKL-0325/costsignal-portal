import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "./supabase";

/**
 * Generate a new raw API key: cs_ + 32 random hex chars
 */
export function generateRawKey(): string {
  const randomHex = randomBytes(16).toString("hex"); // 32 hex chars
  return `cs_${randomHex}`;
}

/**
 * Hash a raw key with SHA-256. This is what we store in the DB.
 */
export function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Extract the display prefix from a raw key (first 10 chars).
 * e.g. "cs_abc123..." → "cs_abc123"
 */
export function getKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, 10);
}

/**
 * Generate a new API key for a user, storing hash in Supabase.
 * Returns the raw key (shown ONCE, never stored).
 */
export async function generateApiKey(
  userId: string,
  label: string = "Default"
): Promise<{ rawKey: string; keyId: string }> {
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .insert({
      user_id: userId,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      label,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to generate API key: ${error.message}`);

  return { rawKey, keyId: data.id };
}

/**
 * Revoke all active keys for a user and issue a new one.
 * Returns the new raw key (shown ONCE).
 */
export async function rotateKey(
  userId: string
): Promise<{ rawKey: string; keyId: string }> {
  // Revoke existing active keys
  const { error: revokeError } = await supabaseAdmin
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (revokeError)
    throw new Error(`Failed to revoke existing keys: ${revokeError.message}`);

  // Generate fresh key
  return generateApiKey(userId, "Default");
}

/**
 * Get the active (non-revoked) key for a user.
 */
export async function getActiveKey(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, key_prefix, created_at, last_used_at, label")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch active key: ${error.message}`);
  }

  return data ?? null;
}

/**
 * Look up a key by its SHA-256 hash.
 * Used by the validate-key API endpoint.
 */
export async function lookupKeyByHash(rawKey: string) {
  const keyHash = hashKey(rawKey);

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, key_prefix, revoked_at")
    .eq("key_hash", keyHash)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Key lookup failed: ${error.message}`);
  }

  return data ?? null;
}
