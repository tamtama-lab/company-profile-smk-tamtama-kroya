import { NextRequest, NextResponse } from "next/server";
import z, { email } from "zod";

// Validation schema
const loginSchema = z.object({
  username: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

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

    const { username, password } = validation.data;

    // TODO: Implementasi autentikasi dengan database
    // Contoh: cek email dan password di database
    // Jika valid, generate JWT token

    // Mock response (ganti dengan logic autentikasi sebenarnya)
    const mockUser = {
      username: username,
      id: "user-123",
    };

    // Generate mock token (gunakan library seperti jsonwebtoken di production)
    const token = Buffer.from(JSON.stringify(mockUser)).toString("base64");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    return NextResponse.json(
      {
        type: "Bearer",
        token: token,
        expiresAt: expiresAt.toISOString(),
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
