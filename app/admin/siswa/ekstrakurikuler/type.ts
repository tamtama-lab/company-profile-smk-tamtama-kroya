export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

export interface ExtracurricularGallery {
  id: number;
  photoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtracurricularAchievement {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtracurricularCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtracurricularItem {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  categoryId: number | null;
  category: ExtracurricularCategory | null;
  categories: string[];
  mentorName: string;
  description: string;
  schedule: string;
  location: string;
  isPublished: boolean;
  galleries: ExtracurricularGallery[];
  achievements: ExtracurricularAchievement[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ExtracurricularListResponse {
  meta: PaginationMeta;
  items: ExtracurricularItem[];
}

export interface ExtracurricularFormValues {
  name: string;
  slug: string;
  categoryId: string;
  mentorName: string;
  schedule: string;
  location: string;
  description: string;
  thumbnailUrl: string;
  isPublished: boolean;
}

export interface ExtracurricularGalleryInputItem {
  clientId: string;
  id?: number;
  previewUrl: string;
  file?: File;
  order: number;
}

export interface ExtracurricularAchievementInputItem {
  clientId: string;
  id?: number;
  name: string;
  order: number;
}

export type ExtracurricularFormMode = "create" | "edit";

