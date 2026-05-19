import { NextResponse, type NextRequest } from "next/server";

import { runPresidentialActionAnalysis } from "@/features/presidential-actions-ai/service";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const bearer = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");

  return bearer === `Bearer ${secret}` || cronHeader === secret;
}

async function handleRequest(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runPresidentialActionAnalysis();

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Presidential action analysis failed",
        ok: false,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
