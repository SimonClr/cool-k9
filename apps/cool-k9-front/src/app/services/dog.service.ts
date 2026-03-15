import { Dog } from '@models';
import { supabase } from '@authentication';

const API_URL = 'http://localhost:3000/api/dogs';

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export class DogService {
  static async getDogs(): Promise<Dog[]> {
    const response = await fetch(API_URL, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dogs');
    const dogs: Dog[] = await response.json();
    return dogs.map(d => ({ ...d, createdAt: new Date(d.createdAt) }));
  }

  static async createDog(name: string, age: number): Promise<Dog> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ name, age }),
    });
    if (!response.ok) throw new Error('Failed to create dog');
    const dog: Dog = await response.json();
    return { ...dog, createdAt: new Date(dog.createdAt) };
  }
}
