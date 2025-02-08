import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateGeoFenceDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsOptional()
  radius?: number;
}
