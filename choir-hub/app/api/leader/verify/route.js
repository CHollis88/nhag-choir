import { NextResponse } from "next/server";
import {
  createLeaderToken,
  verifyLeaderToken,
  LEADER_COOKIE_NAME,
  LEADER_COOKIE_MAX_AGE,
} from "@/lib/leaderAuth";

export async function POST(req) {
  const { pin } = await req.json();
  const expected = process.env.LEADER_PIN;

  if (!expected) {
    return NextResponse.json(
      { error: "Server is missing LEADER_PIN configuration." },
      { status: 500 }
    );
  }

  if (pin !== expected) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const token = createLeaderToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LEADER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: LEADER_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function GET(req) {
  const token = req.cookies.get(LEADER_COOKIE_NAME)?.value;
  const isLeader = verifyLeaderToken(token);
  return NextResponse.json({ isLeader });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(LEADER_COOKIE_NAME);
  return res;
}
