import { Environment, ExerciseType, ObservationStatus, Weather } from '@models';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Upper bound on a session duration, in minutes: a full working day. */
const MAX_DURATION_MINUTES = 480;
/** Free-text fields are bounded to keep a single request from storing unbounded text. */
const MAX_TEXT_LENGTH = 5000;
const MAX_SHORT_TEXT_LENGTH = 255;

/**
 * Every field is optional: a PATCH carries only what changes. Nullable fields accept null
 * as the way to clear a stored value — @IsOptional() skips validation for both undefined
 * and null, so the two intents stay distinguishable by the service.
 */
export class UpdateSessionDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dogIds?: string[];

  @IsOptional()
  @IsEnum(ExerciseType)
  exerciseType?: ExerciseType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_DURATION_MINUTES)
  duration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_SHORT_TEXT_LENGTH)
  location?: string | null;

  @IsOptional()
  @IsLatitude()
  locationLat?: number | null;

  @IsOptional()
  @IsLongitude()
  locationLon?: number | null;

  @IsOptional()
  @IsEnum(Environment)
  environment?: Environment | null;

  @IsOptional()
  @IsEnum(Weather)
  weather?: Weather | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_SHORT_TEXT_LENGTH)
  route?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  previousObjectives?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  nextObjectives?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  ownerObservations?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_TEXT_LENGTH)
  trainerObservations?: string | null;

  @IsOptional()
  @IsEnum(ObservationStatus)
  observationStatus?: ObservationStatus | null;
}
