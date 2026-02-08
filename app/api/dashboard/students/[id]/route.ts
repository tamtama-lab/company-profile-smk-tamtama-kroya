import { error } from "console";
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
  kipNumber?: string;
}

interface ParentDetail {
  fatherName: string;
  fatherLivingStatus: string;
  motherName: string;
  motherLivingStatus: string;
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

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3333";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid registration ID" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/backoffice/registrations/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch registration details" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid registration ID" },
        { status: 400 }
      );
    }

    const body: Partial<RegistrationPayload> = await request.json();

    // Set default values for optional fields if not provided
    const defaultValues: Partial<RegistrationPayload> = {
      studentDetail: {
        nisn: body.studentDetail?.nisn || "",
        nik: body.studentDetail?.nik || "",
        fullName: body.studentDetail?.fullName || "",
        placeOfBirth: body.studentDetail?.placeOfBirth || "",
        dateOfBirth: body.studentDetail?.dateOfBirth || "",
        gender: body.studentDetail?.gender ?? 1,
        religion: body.studentDetail?.religion || "",
        schoolOriginNpsn: body.studentDetail?.schoolOriginNpsn || "",
        address: body.studentDetail?.address || "",
        phoneNumber: body.studentDetail?.phoneNumber || "",
        email: body.studentDetail?.email || "",
        isKipRecipient: body.studentDetail?.isKipRecipient ?? false,
        kipNumber: body.studentDetail?.kipNumber || "",
      },
      parentDetail: {
        fatherName: body.parentDetail?.fatherName || "",
        fatherLivingStatus: body.parentDetail?.fatherLivingStatus || "",
        motherName: body.parentDetail?.motherName || "",
        motherLivingStatus: body.parentDetail?.motherLivingStatus || "",
        parentAddress: body.parentDetail?.parentAddress || "",
        guardianName: body.parentDetail?.guardianName || "",
        guardianPhoneNumber: body.parentDetail?.guardianPhoneNumber || "",
        guardianAddress: body.parentDetail?.guardianAddress || "",
      },
      majorChoiceCode: body.majorChoiceCode || "",
    };

    const response = await fetch(`${API_BASE_URL}/backoffice/registrations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(defaultValues),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update registration" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}