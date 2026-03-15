interface AlumniItem {
  id: number;
  name: string;
  generationYear: number;
  photoUrl: string;
  major: string;
  currentJob: string;
  isPublished?: boolean;
}

interface AlumniApiResponse {
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
  data: AlumniItem[];
}


const CURRENT_YEAR = new Date().getFullYear();
const YEAR_MIN = 1977;
const YEAR_MAX = CURRENT_YEAR - 1;
const YEAR_OPTIONS_LIMIT = 10;

export { type AlumniItem, type AlumniApiResponse, YEAR_MIN, YEAR_MAX, YEAR_OPTIONS_LIMIT };