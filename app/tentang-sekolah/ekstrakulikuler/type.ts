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

export interface ExtracurricularListItem {
  name: string;
  thumbnail: string;
  category: string[];
  slug?: string;
}

export interface ExtracurricularListResponse {
  meta: PaginationMeta;
  items: ExtracurricularListItem[];
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
  categories: string[];
  mentorName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  galleries: ExtracurricularGalleryItem[];
  achievements: ExtracurricularAchievementItem[];
}
