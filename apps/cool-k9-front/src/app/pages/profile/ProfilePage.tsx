import { UserProfileCard } from './components/UserProfileCard';
import { DogsCard } from './components/DogsCard';

export function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <UserProfileCard />
      <DogsCard />
    </div>
  );
}
