/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

// Note: For real backend we expect an endpoint for uploading brochure files.
// This mock endpoint accepts multipart/form-data and returns mock URLs.

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // If proxying to real backend
    if (process.env.BACKEND_URL && authHeader) {
      // Forward the multipart form to backend - keep body as stream
      const backendResponse = await fetch(`${API_BASE_URL}/backoffice/school-settings/brochure`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        // forward raw body
        body: await request.arrayBuffer(),
      });

      const data = await backendResponse.json();
      if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
      }

      return NextResponse.json(data, { status: 200 });
    }

    // Mock behavior: inspect FormData for fields brochureFront / brochureBack
    // We will simply return generated URLs using Date.now() for filenames
    const now = Date.now();
    const form = await request.formData();
    const front = form.get("brochureFront");
    const back = form.get("brochureBack");

    const result: any = {};

    if (front) {
      // pretend we uploaded and returned a URL
      result.brochureFrontUrl = `https://mock.local/brochures/front-${now}.pdf`;
    }
    if (back) {
      result.brochureBackUrl = `https://mock.local/brochures/back-${now}.pdf`;
    }

    // If no files were present, return both sample urls
    if (!result.brochureFrontUrl && !result.brochureBackUrl) {
      result.brochureFrontUrl = `https://mock.local/brochures/front-${now}.pdf`;
      result.brochureBackUrl = `https://mock.local/brochures/back-${now}.pdf`;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("brochure upload error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // If proxying to real backend - forward the delete (no body)
    if (process.env.BACKEND_URL && authHeader) {
      const url = new URL(`${API_BASE_URL}/backoffice/school-settings/brochure`);
      const field = new URL(request.url).searchParams.get("field");
      if (field) url.searchParams.set("field", field);

      const backendResponse = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await backendResponse.json();
      if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
      }

      return NextResponse.json(data, { status: 200 });
    }

    // Mock behavior: delete based on ?field=front|back|both (default both)
    const url = new URL(request.url);
    const field = url.searchParams.get("field") || "both";

    const result: any = {};

    if (field === "front" || field === "both") {
      result.brochureFrontUrl = null;
    }
    if (field === "back" || field === "both") {
      result.brochureBackUrl = null;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("brochure delete error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
