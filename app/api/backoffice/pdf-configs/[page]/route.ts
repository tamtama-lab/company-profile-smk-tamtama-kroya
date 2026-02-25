import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3333";

const ALLOWED_PAGES = new Set(["2", "3"]);

type Params = { params: Promise<{ page: string }> };

const readBackendPayload = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return { message: "Invalid backend response" };
  }
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { page } = await params;

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "E_UNAUTHORIZED_ACCESS",
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    if (!ALLOWED_PAGES.has(page)) {
      return NextResponse.json(
        { message: "Invalid page parameter" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/pdf-configs/${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    const data = await readBackendPayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching pdf config:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { page } = await params;

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "E_UNAUTHORIZED_ACCESS",
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    if (!ALLOWED_PAGES.has(page)) {
      return NextResponse.json(
        { message: "Invalid page parameter" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/pdf-configs/${page}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await readBackendPayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating pdf config:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
