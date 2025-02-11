import { IsNotEmpty, IsString } from 'class-validator';

export class QueryInputDto {
  @IsNotEmpty()
  @IsString()
  lat: string;

  @IsNotEmpty()
  @IsString()
  lng: string;
}
