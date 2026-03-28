import { Dog } from '@models';
import { supabase } from '@authentication';

const API_URL = 'http://localhost:3000/api/dogs';

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

function mapDog(d: Dog): Dog {
  return { ...d, birthDate: new Date(d.birthDate), createdAt: new Date(d.createdAt) };
}

export class DogService {
  static async getDogs(userId?: string): Promise<Dog[]> {
    const url = userId ? `${API_URL}?userId=${encodeURIComponent(userId)}` : API_URL;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dogs');
    const dogs: Dog[] = await response.json();
    return dogs.map(mapDog);
  }

  static async createDog(name: string, birthDate: Date): Promise<Dog> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ name, birthDate: birthDate.toISOString().split('T')[0] }),
    });
    if (!response.ok) throw new Error('Failed to create dog');
    const dog: Dog = await response.json();
    return mapDog(dog);
  }

  static async updateDog(id: string, name: string, birthDate: Date): Promise<Dog> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ name, birthDate: birthDate.toISOString().split('T')[0] }),
    });
    if (!response.ok) throw new Error('Failed to update dog');
    const dog: Dog = await response.json();
    return mapDog(dog);
  }
}
