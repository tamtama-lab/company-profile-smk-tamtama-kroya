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

export interface SchoolFacilityCategoryOption {
  id: number;
  name: string;
}

export interface SchoolFacilityListItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
  description: string;
  coverPhotoUrl: string;
  galleryDescription: string;
  isPublished: boolean;
  category: SchoolFacilityCategoryOption | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SchoolFacilityListResponse {
  meta: PaginationMeta;
  data: SchoolFacilityListItem[];
}

export interface SchoolFacilityGalleryItem {
  id: number;
  photoUrl: string;
  order: number;
}

export interface SchoolFacilityDetail extends SchoolFacilityListItem {
  galleries: SchoolFacilityGalleryItem[];
}
