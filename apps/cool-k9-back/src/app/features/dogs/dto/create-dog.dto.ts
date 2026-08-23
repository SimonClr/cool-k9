import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const MAX_NAME_LENGTH = 80;

export class CreateDogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  // Date-only value (YYYY-MM-DD), matching the `date` column it is stored in.
  @IsDateString()
  birthDate: string;
}
