import { IsOptional, IsString } from 'class-validator';

export class QueryInputDto {
  @IsOptional()
  @IsString()
  lat: string;

  @IsOptional()
  @IsString()
  lng: string;
}
