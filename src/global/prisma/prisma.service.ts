import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {

    async onModuleInit() {
        try {
            await this.$connect()
        } catch (error) {
            console.log("Error connecting to the database!!",error);
            throw new Error("Cannot connect to the database!")
            
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect()
        } catch (error) {
            console.log("Error disconnecting to the database!!");
        }
    }
}