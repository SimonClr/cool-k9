import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@authentication';
import { UserService } from '../services/user.service';

export function useUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['users'],
    queryFn: UserService.getUsers,
    enabled: !!user?.isAdmin,
  });
}
