import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // Proxy to backend batches endpoint
    const backendRes = await fetch(`${API_BASE_URL}/backoffice/registration-batches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      // cache at server level; frontends should still request cached /api/filters/options
      next: { revalidate: 60 },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Map to options with dates and disabled flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (data || []).map((b: any) => ({
      id: b.id,
      name: b.name || b.title || `Gelombang ${b.id}`,
      dateStart: b.dateStart || null,
      dateEnd: b.dateEnd || null,
      isActive: Number(b.isActive) === 1 ? 1 : 0,
      order: b.order ?? null,
    }));

    return NextResponse.json(mapped, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Batches options error:", err);
    return NextResponse.json({ error: "failed_to_fetch_batches" }, { status: 500 });
  }
}
