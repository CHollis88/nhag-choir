import { verifyLeaderToken, LEADER_COOKIE_NAME } from "@/lib/leaderAuth";

// Returns true if the incoming request carries a valid leader session cookie.
export function isLeaderRequest(req) {
  const token = req.cookies.get(LEADER_COOKIE_NAME)?.value;
  return verifyLeaderToken(token);
}
