import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated" },
      { status: 401 }
    );
  }

  // Decode the JWT to get the Privy DID
  const token = authHeader.replace("Bearer ", "");
  let did: string;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    did = payload.sub;
    if (!did) throw new Error("No sub claim");
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid token" },
      { status: 401 }
    );
  }

  // Look up wallet address from Privy
  const appId = process.env.PRIVY_APP_ID!;
  const appSecret = process.env.PRIVY_APP_SECRET!;
  const res = await fetch(`https://api.privy.io/v1/users/${did}`, {
    headers: {
      Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`,
      "privy-app-id": appId,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch user from Privy" },
      { status: res.status }
    );
  }

  const user = await res.json();
  const wallet = user.linked_accounts?.find(
    (a: { type: string }) => a.type === "wallet"
  );

  if (!wallet?.address) {
    return NextResponse.json(
      { status: "error", message: "No wallet linked" },
      { status: 404 }
    );
  }

  return NextResponse.json({ address: wallet.address });
}
