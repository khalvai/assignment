import { Module } from "@nestjs/common";
import { NestjsEventEmitterModule } from "src/Common/Infrastructure/Output/NestjsEventEmitterModule";
import PrismaModule from "src/Common/Infrastructure/Output/PrismaModule";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule } from "@nestjs/config";
import { ProductMapper } from "src/Product/Infrastructure/ProductMapper";
import { ProductRepository } from "src/Product/Application/Ports/Output/ProductRepository";
import { PostgresqlProductRepository } from "src/Product/Infrastructure/PostgresqlProductRepository";
import { CreateManyImpl } from "src/Product/Application/Ports/Input/CreateManyImpl";
import { ProductController } from "src/Product/Infrastructure/HTTP/controller";







@Module({
    imports: [PrismaModule, NestjsEventEmitterModule, CqrsModule, ConfigModule],
    controllers: [ProductController],
    providers: [
        {
            provide: ProductRepository,
            useClass: PostgresqlProductRepository
        },

        ProductMapper,
        CreateManyImpl
    ]
})
export class ProductModule { }