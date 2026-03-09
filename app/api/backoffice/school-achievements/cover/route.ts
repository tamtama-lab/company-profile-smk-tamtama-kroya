import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const unauthorizedResponse = () =>
  NextResponse.json(
    {
      error: "E_UNAUTHORIZED_ACCESS",
      message: "Not authenticated",
    },
    { status: 401 },
  );

const isAllowedImageMime = (mimeType: string) =>
  ["image/png", "image/jpeg", "image/jpg"].includes(mimeType.toLowerCase());

const getSafePayload = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const coverFile = formData.get("cover");

    if (!coverFile || !(coverFile instanceof File)) {
      return NextResponse.json(
        { error: "File cover tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!isAllowedImageMime(coverFile.type)) {
      return NextResponse.json(
        { error: "Format file harus png, jpg, atau jpeg" },
        { status: 400 },
      );
    }

    if (coverFile.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 413 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("cover", coverFile);

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/school-achievements/cover`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: backendFormData,
      },
    );

    const data = await getSafePayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("School achievement cover upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload cover" },
      { status: 500 },
    );
  }
}
