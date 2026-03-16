import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.inprocess.world/api";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_BASE}/oauth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, code: body.code }),
  });

  const data = await res.json().catch(() => ({ status: "error", message: "Login failed" }));
  return NextResponse.json(data, { status: res.status });
}
