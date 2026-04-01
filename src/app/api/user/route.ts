import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.inprocess.world/api";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const res = await fetch(`${API_BASE}/oauth`, {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch user" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ address: data.artistAddress });
}
