import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator"

export class updateGeoFenceDTO{
    @IsOptional()
    @IsString()
    name?:string

    @IsOptional()    @IsString()
    description?:string

    @IsNumber()
    @IsOptional()
    radius?:number
}