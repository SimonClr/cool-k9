export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UsersPage {
  users: User[];
  total: number;
  page: number;
  perPage: number;
}
