/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_DATA } from "../route";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/contact-info`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      );

      const data = await backendResponse.json();
      if (!backendResponse.ok) return NextResponse.json(data, { status: backendResponse.status });
      return NextResponse.json(data, { status: 200 });
    }

    // Local mock: return only contact fields
    const result = {
      email: MOCK_DATA.email,
      phone: MOCK_DATA.phone,
      website: MOCK_DATA.website,
      address: MOCK_DATA.address,
      updatedAt: MOCK_DATA.updatedAt,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("contact-info fetch error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // Proxy to backend if configured
    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/contact-info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: await request.text(),
        }
      );

      const data = await backendResponse.json();
      if (!backendResponse.ok) return NextResponse.json(data, { status: backendResponse.status });
      return NextResponse.json(data, { status: 200 });
    }

    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};

    // Validate payload shape
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
    }

    const allowed = ["email", "phone", "website", "address"];

    for (const key of Object.keys(body)) {
      if (!allowed.includes(key)) {
        return NextResponse.json({ error: `Field ${key} tidak diizinkan` }, { status: 400 });
      }
      if (body[key] !== null && typeof body[key] !== "string") {
        return NextResponse.json({ error: `Field ${key} harus berupa string atau null` }, { status: 400 });
      }
    }

    // Update mock
    for (const k of allowed) {
      if (k in body) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        MOCK_DATA[k] = body[k];
      }
    }

    MOCK_DATA.updatedAt = new Date().toISOString();

    const result = {
      email: MOCK_DATA.email,
      phone: MOCK_DATA.phone,
      website: MOCK_DATA.website,
      address: MOCK_DATA.address,
      updatedAt: MOCK_DATA.updatedAt,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("contact-info update error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}