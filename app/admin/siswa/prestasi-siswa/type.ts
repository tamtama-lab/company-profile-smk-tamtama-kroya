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

export interface SchoolAchievementGallery {
  id: number;
  photoUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolAchievementAward {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolAchievementItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  competitionLevel: string;
  placeName: string;
  organizerName: string;
  competitionDate: string;
  category: string;
  participantName: string;
  coverPhotoUrl: string;
  isPublished: boolean;
  galleries: SchoolAchievementGallery[];
  awards: SchoolAchievementAward[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SchoolAchievementListResponse {
  meta: PaginationMeta;
  items: SchoolAchievementItem[];
}

export interface SchoolAchievementFormValues {
  title: string;
  slug: string;
  schoolName: string;
  competitionLevel: string;
  placeName: string;
  organizerName: string;
  competitionDate: string;
  category: string;
  participantName: string;
  description: string;
  coverPhotoUrl: string;
  isPublished: boolean;
}

export interface SchoolAchievementGalleryInputItem {
  clientId: string;
  id?: number;
  previewUrl: string;
  file?: File;
  order: number;
}

export interface SchoolAchievementAwardInputItem {
  clientId: string;
  id?: number;
  name: string;
  order: number;
}

export type SchoolAchievementFormMode = "create" | "edit";
