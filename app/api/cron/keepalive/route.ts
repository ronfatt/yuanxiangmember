import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { runKeepAlive } from "../../../../lib/metaenergy/service";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.replace(/^Bearer\s+/i, "");
  const cronHeader = request.headers.get("x-cron-secret");

  return bearer === secret || cronHeader === secret;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const result = await runKeepAlive(supabaseAdmin());
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron execution failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
