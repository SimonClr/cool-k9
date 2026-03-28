import { Injectable } from '@nestjs/common';
import { Dog } from '@models';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDogDto } from './create-dog.dto';
import { UpdateDogDto } from './update-dog.dto';

@Injectable()
export class DogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getDogs(userId: string): Promise<Dog[]> {
    const { data, error } = await this.supabaseService.admin
      .from('dogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map(row => ({
      id: row['id'],
      name: row['name'],
      birthDate: new Date(row['birth_date']),
      userId: row['user_id'],
      createdAt: new Date(row['created_at']),
    }));
  }

  async createDog(userId: string, dto: CreateDogDto): Promise<Dog> {
    const { data, error } = await this.supabaseService.admin
      .from('dogs')
      .insert({ name: dto.name, birth_date: dto.birthDate, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data['id'],
      name: data['name'],
      birthDate: new Date(data['birth_date']),
      userId: data['user_id'],
      createdAt: new Date(data['created_at']),
    };
  }

  async updateDog(userId: string, id: string, dto: UpdateDogDto): Promise<Dog> {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch['name'] = dto.name;
    if (dto.birthDate !== undefined) patch['birth_date'] = dto.birthDate;

    const { data, error } = await this.supabaseService.admin
      .from('dogs')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data['id'],
      name: data['name'],
      birthDate: new Date(data['birth_date']),
      userId: data['user_id'],
      createdAt: new Date(data['created_at']),
    };
  }
}
