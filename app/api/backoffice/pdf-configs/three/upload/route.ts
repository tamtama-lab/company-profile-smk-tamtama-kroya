import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_URL ||
  "http://localhost:3333";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const readBackendPayload = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return { message: "Invalid backend response" };
  }
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "E_UNAUTHORIZED_ACCESS",
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message: "Format file tidak didukung. Gunakan pdf, png, jpg, atau jpeg",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 5MB" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const backendResponse = await fetch(
      `${API_BASE_URL}/backoffice/pdf-configs/three/upload`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: backendFormData,
      },
    );

    const data = await readBackendPayload(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error uploading page three file:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
