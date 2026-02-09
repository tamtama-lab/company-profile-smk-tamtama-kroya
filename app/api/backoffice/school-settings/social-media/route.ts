/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_DATA } from "../route";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/social-media`,
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
      { socialMedia: MOCK_DATA.socialMedia || {} },
      { status: 200 }
    );
  } catch (err) {
    console.error("social-media fetch error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings/social-media`,
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

    const allowed = ["facebook", "instagram", "tiktok", "youtube"];
    for (const key of Object.keys(body)) {
      if (!allowed.includes(key)) {
        return NextResponse.json({ error: `Field ${key} tidak diizinkan` }, { status: 400 });
      }
    }

    const nextSocial = { ...(MOCK_DATA.socialMedia || {}) };

    if ("facebook" in body) {
      const fb = body.facebook || {};
      if (typeof fb.url !== "string" || typeof fb.isActive !== "boolean") {
        return NextResponse.json(
          { error: "Field facebook tidak valid" },
          { status: 400 }
        );
      }
      nextSocial.facebook = { url: fb.url, isActive: fb.isActive };
    }

    if ("tiktok" in body) {
      const tk = body.tiktok || {};
      if (typeof tk.url !== "string" || typeof tk.isActive !== "boolean") {
        return NextResponse.json(
          { error: "Field tiktok tidak valid" },
          { status: 400 }
        );
      }
      nextSocial.tiktok = { url: tk.url, isActive: tk.isActive };
    }

    if ("youtube" in body) {
      const yt = body.youtube || {};
      if (typeof yt.url !== "string" || typeof yt.isActive !== "boolean") {
        return NextResponse.json(
          { error: "Field youtube tidak valid" },
          { status: 400 }
        );
      }
      nextSocial.youtube = { url: yt.url, isActive: yt.isActive };
    }

    if ("instagram" in body) {
      if (!Array.isArray(body.instagram)) {
        return NextResponse.json(
          { error: "Field instagram harus berupa array" },
          { status: 400 }
        );
      }
      nextSocial.instagram = body.instagram.map((item: any) => {
        const url = typeof item.url === "string" ? item.url : "";
        const isActive = typeof item.isActive === "boolean" ? item.isActive : true;
        return { url, isActive };
      });
    }

    MOCK_DATA.socialMedia = nextSocial;
    MOCK_DATA.updatedAt = new Date().toISOString();

    return NextResponse.json(
      { socialMedia: MOCK_DATA.socialMedia, updatedAt: MOCK_DATA.updatedAt },
      { status: 200 }
    );
  } catch (err) {
    console.error("social-media update error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
