import { Request, User } from './schema.types';

export interface PaginatedRequestResponse {
  page: number;
  limit: number;
  total: number;
  requests: Request[];
}

export interface PaginatedRequestList {
  page: number;
  limit: number;
  total: number;
  requests: Request[];
}

export interface AdminUserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
