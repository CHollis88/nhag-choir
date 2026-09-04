import crypto from "crypto";

const COOKIE_NAME = "leader_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

// Builds a simple signed token: "<expiryTimestamp>.<signature>"
export function createLeaderToken() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyLeaderToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

export const LEADER_COOKIE_NAME = COOKIE_NAME;
export const LEADER_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
