import { Role } from "@prisma/client"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class registerDTO{
    @IsNotEmpty()
    @IsString()
    name:string

    @IsNotEmpty()
    @IsString()
    email:string

    @IsNotEmpty()
    @IsString()
    password:string

    @IsOptional()
    role?:Role

}