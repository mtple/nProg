import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.inprocess.world/api";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const res = await fetch(`${API_BASE}/moment/collect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({ status: "error", message: "Collect failed" }));
  return NextResponse.json(data, { status: res.status });
}
