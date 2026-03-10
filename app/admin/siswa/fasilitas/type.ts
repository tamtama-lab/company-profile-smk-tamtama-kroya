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

export interface SchoolFacilityCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolFacilityGallery {
  id: number;
  photoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolFacilityItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
  description: string;
  coverPhotoUrl: string;
  galleryDescription: string;
  isPublished: boolean;
  categoryId: number | null;
  category: SchoolFacilityCategory | null;
  galleries: SchoolFacilityGallery[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SchoolFacilityListResponse {
  meta: PaginationMeta;
  items: SchoolFacilityItem[];
}

export interface SchoolFacilityFormValues {
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  coverPhotoUrl: string;
  galleryDescription: string;
  isPublished: boolean;
}

export interface SchoolFacilityGalleryInputItem {
  clientId: string;
  id?: number;
  previewUrl: string;
  file?: File;
  order: number;
}

export type SchoolFacilityFormMode = "create" | "edit";
