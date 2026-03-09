"use client";

import SchoolAchievementFormPage from "../../SchoolAchievementFormPage";
import { resolveSlug } from "@/utils/resolveSlug";
import { useParams } from "next/navigation";

export default function EditSchoolAchievementPage() {
  const params = useParams();
  const slug = resolveSlug(params?.slug);

  return <SchoolAchievementFormPage mode="edit" slug={slug} />;
}
