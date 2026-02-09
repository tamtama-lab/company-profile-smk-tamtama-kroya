/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_DATA } from "../route";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/whatsapp`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      );

      const data = await backendResponse.json();
      if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
      }

      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { whatsappNumbers: MOCK_DATA.whatsappNumbers || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("whatsapp fetch error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/whatsapp`,
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
      if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
      }

      return NextResponse.json(data, { status: 200 });
    }

    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
    }

    if (!Array.isArray(body.whatsappNumbers)) {
      return NextResponse.json(
        { error: "Field whatsappNumbers harus berupa array" },
        { status: 400 }
      );
    }

    const sanitized = body.whatsappNumbers.map((item: any) => {
      const label = typeof item.label === "string" ? item.label : "";
      const name = typeof item.name === "string" ? item.name : "";
      const numberRaw = typeof item.number === "string" ? item.number : "";
      const number = String(numberRaw).replace(/\D/g, "");
      const isActive = typeof item.isActive === "boolean" ? item.isActive : true;
      return { label, name, number, isActive };
    });

    MOCK_DATA.whatsappNumbers = sanitized;
    MOCK_DATA.updatedAt = new Date().toISOString();

    return NextResponse.json(
      { whatsappNumbers: MOCK_DATA.whatsappNumbers, updatedAt: MOCK_DATA.updatedAt },
      { status: 200 }
    );
  } catch (err) {
    console.error("whatsapp update error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
