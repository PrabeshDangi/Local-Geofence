import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class createGeofenceDTO{
    @IsNotEmpty()
    @IsString()
    name:string

    @IsNotEmpty()
    @IsString()
    description:string

    @IsNumber()
    @IsNotEmpty()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    radius:number
}