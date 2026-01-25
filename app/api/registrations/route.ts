import { NextRequest, NextResponse } from "next/server";

interface StudentDetail {
  nisn: string;
  nik: string;
  fullName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: number;
  religion: string;
  schoolOriginNpsn: string;
  address: string;
  phoneNumber: string;
  email: string;
  isKipRecipient: boolean;
}

interface ParentDetail {
  fatherName: string;
  fatherLivingStatus: string;
  motherName: string;
  motherLivingStatus: string;
  parentPhoneNumber: string;
  parentAddress: string;
  guardianName: string;
  guardianPhoneNumber: string;
  guardianAddress: string;
}

interface RegistrationPayload {
  studentDetail: StudentDetail;
  parentDetail: ParentDetail;
  majorChoiceCode: string;
}

interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationPayload = await request.json();

    // Validate required fields
    if (!body.studentDetail || !body.parentDetail || !body.majorChoiceCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data yang diperlukan tidak lengkap" 
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BACKEND_URL || process.env.API_BASE_URL;

    if (!baseUrl) {
      console.error("API_BASE_URL not configured");
      return NextResponse.json(
        {
          success: false,
          message: "Kesalahan konfigurasi server. Silakan hubungi administrator.",
        },
        { status: 500 }
      );
    }

    // POST to external API
    const apiResponse = await fetch(`${baseUrl}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      // Translate error message
      let translatedMessage = apiData.message || "Terjadi kesalahan saat memproses pendaftaran.";
      if (translatedMessage === "The given data was invalid") {
        translatedMessage = "Data yang diberikan tidak valid";
      }

      return NextResponse.json(
        {
          success: false,
          message: translatedMessage,
          errors: apiData.errors || [],
          errorCode: apiData.error || undefined,
        },
        { status: apiResponse.status }
      );
    }

    // Return success response from external API
    return NextResponse.json(
      {
        success: true,
        message: apiData.message || "Pendaftaran berhasil! Bukti pendaftaran telah dikirim ke email Anda.",
        data: {
          registrationNumber: apiData.registrationNumber,
          registrationId: apiData.id,
          majorChoiceCode: apiData.majorChoiceCode,
          studentName: apiData.studentDetail?.fullName || body.studentDetail.fullName,
          createdAt: apiData.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
