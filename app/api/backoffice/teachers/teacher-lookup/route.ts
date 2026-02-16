import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || process.env.API_BASE_URL;

interface TeacherItem {
  id?: number;
  fullName?: string;
  name?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (query.length > 0 && query.length < 3) {
    return NextResponse.json(
      {
        error: "E_VALIDATION_ERROR",
        message: "The q field must have at least 3 characters",
        errors: [
          {
            field: "q",
            message: "The q field must have at least 3 characters",
            rule: "minLength",
          },
        ],
      },
      { status: 422 }
    );
  }

  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        error: "SERVER_CONFIG_ERROR",
        message: "Server configuration error (BACKEND_URL not set)",
      },
      { status: 500 }
    );
  }

  try {
    const authHeader = request.headers.get("Authorization");
    const queryParams = new URLSearchParams({ limit: "10" });
    if (query.length > 0) {
      queryParams.append("q", query);
    }
    const response = await fetch(
      `${API_BASE_URL}/backoffice/teachers/lookup?${queryParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
           Authorization: authHeader || "",
        },
      }
    );
    const data = await response.json();

    let teachers: Array<{ id: number | string; fullName: string }> = [];
    const normalizeTeacher = (item: TeacherItem) => ({
      id: item.id ?? "",
      fullName: item.fullName || item.name || "",
    });
    if (Array.isArray(data)) {
      teachers = data.map(normalizeTeacher).filter((item) => item.fullName);
    } else if (data.data && Array.isArray(data.data)) {
      teachers = data.data
        .map(normalizeTeacher)
        .filter((item: { fullName: string; }) => item.fullName);
    } else if (data.teachers && Array.isArray(data.teachers)) {
      teachers = data.teachers
        .map(normalizeTeacher)
        .filter((item: { fullName: string; }) => item.fullName);
    }
    teachers = teachers.slice(0, 10);

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Teacher lookup error:", error);
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Terjadi kesalahan saat mengambil data guru",
      },
      { status: 500 }
    );
  }
}