import { Dog } from '@models';
import { apiFetchDogs, apiCreateDog, apiUpdateDog } from '../api/dog.api';

function mapDog(d: Dog): Dog {
  return { ...d, birthDate: new Date(d.birthDate), createdAt: new Date(d.createdAt) };
}

export class DogService {
  static async getDogs(userId?: string): Promise<Dog[]> {
    const dogs = await apiFetchDogs(userId);
    return dogs.map(mapDog);
  }

  static async createDog(name: string, birthDate: Date): Promise<Dog> {
    const dog = await apiCreateDog(name, birthDate.toISOString().split('T')[0]);
    return mapDog(dog);
  }

  static async updateDog(id: string, name: string, birthDate: Date): Promise<Dog> {
    const dog = await apiUpdateDog(id, name, birthDate.toISOString().split('T')[0]);
    return mapDog(dog);
  }
}
