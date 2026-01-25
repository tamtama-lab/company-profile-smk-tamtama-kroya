import { NextRequest, NextResponse } from "next/server";

interface StudentDetail {
  nisn: string;
  nik: string;
  fullName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
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

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationPayload = await request.json();

    // Validate required fields
    if (!body.studentDetail || !body.parentDetail || !body.majorChoiceCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields" 
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
          message: "Server configuration error. Please contact administrator.",
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
      return NextResponse.json(
        {
          success: false,
          message: apiData.message || "Terjadi kesalahan saat memproses pendaftaran.",
        },
        { status: apiResponse.status }
      );
    }

    // Return success response from external API
    return NextResponse.json(
      {
        success: true,
        message: apiData.message || "Pendaftaran berhasil! Bukti pendaftaran telah dikirim ke email Anda.",
        data: apiData.data || {
          registrationId: apiData.registrationId,
          registrationDate: apiData.registrationDate,
          studentName: body.studentDetail.fullName,
          majorChoice: body.majorChoiceCode,
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
