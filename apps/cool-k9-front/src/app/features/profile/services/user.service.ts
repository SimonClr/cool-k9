import { apiFetchUsers } from '../api/user.api';

export class UserService {
  static async getUsers(params?: {
    search?: string;
    page?: number;
    perPage?: number;
  }) {
    return apiFetchUsers(params);
  }
}
