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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const photoFile = formData.get("photo");

    if (!photoFile || !(photoFile instanceof File)) {
      return NextResponse.json(
        { error: "File foto tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!isAllowedImageMime(photoFile.type)) {
      return NextResponse.json(
        { error: "Format file harus png, jpg, atau jpeg" },
        { status: 400 },
      );
    }

    if (photoFile.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 413 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("photo", photoFile);

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/extracurriculars/galleries/upload`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: backendFormData,
      },
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Extracurricular gallery upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload gallery photo" },
      { status: 500 },
    );
  }
}
