import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const MAX_NAME_LENGTH = 80;

export class UpdateDogDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  name?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
