"use client";

import SchoolFacilityFormPage from "../../SchoolFacilityFormPage";
import { resolveSlug } from "@/utils/resolveSlug";
import { useParams } from "next/navigation";

export default function EditSchoolFacilityPage() {
  const params = useParams();
  const slug = resolveSlug(params?.slug);

  return <SchoolFacilityFormPage mode="edit" slug={slug} />;
}
