import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  remember_me: z.boolean().optional().default(false),
});

// Backend API URL - sesuaikan dengan environment
const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { username, password, remember_me } = validation.data;

    // Call backend API untuk autentikasi
    const backendResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: backendData.message || "Username atau password salah",
        },
        { status: backendResponse.status }
      );
    }

    // Calculate expiration based on remember_me
    // If remember_me is true, use longer expiration (7 days)
    // If remember_me is false, use session-based expiration (1 day)
    const expirationDays = remember_me ? 7 : 1;
    const expiresAt = backendData.expiresAt || new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

    // Return response sesuai format yang diharapkan
    return NextResponse.json(
      {
        access_token: backendData.access_token,
        expiresAt: expiresAt,
        user: backendData.user,
        remember_me: remember_me,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
