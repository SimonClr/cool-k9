import { apiFetchUsers } from '../api/user.api';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UsersPage {
  users: AppUser[];
  total: number;
  page: number;
  perPage: number;
}

export class UserService {
  static async getUsers(params?: {
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<UsersPage> {
    return apiFetchUsers(params);
  }
}
