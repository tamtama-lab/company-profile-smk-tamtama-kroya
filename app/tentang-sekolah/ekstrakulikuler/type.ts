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

export interface ExtracurricularCategoryOption {
  id: number;
  name: string;
}

export interface ExtracurricularListItem {
  name: string;
  slug: string;
  thumbnailUrl: string;
  categoryId: number | null;
  category: ExtracurricularCategoryOption | null;
}

export interface ExtracurricularListResponse {
  meta: PaginationMeta;
  data: ExtracurricularListItem[];
}

export interface ExtracurricularGalleryItem {
  id: number;
  extracurricularId: number;
  photoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtracurricularAchievementItem {
  id: number;
  extracurricularId: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtracurricularDetail {
  location: string;
  schedule: string;
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string;
  isPublished: boolean;
  category: ExtracurricularCategoryOption | null;
  mentorName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  galleries: ExtracurricularGalleryItem[];
  achievements: ExtracurricularAchievementItem[];
}
