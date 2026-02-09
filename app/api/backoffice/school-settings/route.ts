/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

// Initial mock data (from user story sample)
const MOCK: any = {
  id: 1,
  email: "smktamtamakroya.clp@yahoo.com",
  phone: "081234567890",
  website: "https://smktamtamakroya.sch.id",
  address:
    "Jl. Semangka, Kedawung, Kroya, Cilacap, Jawa Tengah, 53282",
  whatsappNumbers: [
    { name: "WR", label: "Admin 1", number: "081325767718", isActive: true },
    { name: "Anas", label: "Admin 2", number: "088215261410", isActive: true },
  ],
  socialMedia: {
    tiktok: {
      url: "https://tiktok.com/@smktamtamakroya.clp",
      isActive: true,
    },
    youtube: {
      url: "https://youtube.com/smktamtamakroya4678",
      isActive: true,
    },
    facebook: {
      url: "https://www.facebook.com/people/SMK-Tamtama-KROYA/100067793231479",
      isActive: true,
    },
    instagram: [
      { url: "https://instagram.com/smk_tamtama_kroya", isActive: true },
      { url: "https://instagram.com/autotama_garage", isActive: true },
      { url: "https://instagram.com/osis_smktamtama_kroya", isActive: true },
      { url: "https://instagram.com/alumnitamtama", isActive: true },
    ],
  },
  brochureFrontUrl: null,
  brochureBackUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mutable mock (keeps state in server process for development)
export const MOCK_DATA = { ...MOCK };

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // Proxy to backend if BACKEND_URL configured and auth present
    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings`,
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

    // Fallback to mock
    return NextResponse.json(MOCK_DATA, { status: 200 });
  } catch (error) {
    console.error("school-settings fetch error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // Proxy to backend if configured
    if (process.env.BACKEND_URL && authHeader) {
      const backendResponse = await fetch(
        `${API_BASE_URL}/backoffice/school-settings`,
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

    // Local mock behavior - update MOCK_DATA
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};

    // Basic validation
    if (typeof body !== "object") {
      return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
    }

    // Update fields we care about
    for (const key of [
      "email",
      "phone",
      "website",
      "address",
      "whatsappNumbers",
      "socialMedia",
      "brochureFrontUrl",
      "brochureBackUrl",
    ]) {
      if (key in body) {
        // simple replace
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        MOCK_DATA[key] = body[key];
      }
    }

    MOCK_DATA.updatedAt = new Date().toISOString();

    return NextResponse.json(MOCK_DATA, { status: 200 });
  } catch (error) {
    console.error("school-settings update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
