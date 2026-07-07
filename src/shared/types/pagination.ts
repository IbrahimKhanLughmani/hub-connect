export interface PaginatedResult<T> {
  items: T[];
  nextPage: number | null;
  totalCount: number;
}
