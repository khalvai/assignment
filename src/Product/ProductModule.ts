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
import { TokenService } from "src/Common/Application/Output/TokenService";
import JWTokenService from "src/Common/Infrastructure/Output/JWTokenService";
import { GetAllImp } from "src/Product/Application/Ports/Input/GetAllImpl";
import { DeleteAllImpl } from "src/Product/Application/Ports/Input/DeleteAllImpl";







@Module({
    imports: [PrismaModule, NestjsEventEmitterModule, CqrsModule, ConfigModule],
    controllers: [ProductController],
    providers: [
        {
            provide: ProductRepository,
            useClass: PostgresqlProductRepository
        },
        {
            provide: TokenService,
            useClass: JWTokenService,
        },

        ProductMapper,
        CreateManyImpl,
        GetAllImp,
        DeleteAllImpl
    ]
})
export class ProductModule { }