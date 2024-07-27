import { Injectable } from "@nestjs/common";
import PrismaService from "src/Common/Infrastructure/Output/PrismaService";
import { ProductRepository } from "src/Product/Application/Ports/Output/ProductRepository";
import Code from "src/Product/Domain/Code";
import { Product } from "src/Product/Domain/Product";
import { ProductReadModel } from "src/Product/Infrastructure/Models/ProductReadModel";
import { ProductMapper } from "src/Product/Infrastructure/ProductMapper";
import UserId from "src/User/Domain/UserId";

@Injectable()
export class PostgresqlProductRepository implements ProductRepository {


    constructor(private readonly prisma: PrismaService, private readonly mapper: ProductMapper) { }



    async productExistsIn(codes: Code[]): Promise<boolean> {
        const stringCodes = codes.map(c => c.value)

        const exists = await this.prisma.product.findMany({
            where: {
                code: {
                    in: stringCodes
                }
            }
        })
        return exists.length > 0 ? true : false

    }
    async save(product: Product): Promise<void> {
        const productModel = this.mapper.toPersistent(product)
        await this.prisma.product.create({
            data: productModel
        })
        return
    }
    async saveAll(products: Product[]): Promise<void> {

        const productsModel = products.map(p => this.mapper.toPersistent(p))
        await this.prisma.product.createMany({
            data: productsModel
        })

        return
    }

    async getAll(userId: UserId): Promise<ProductReadModel[]> {

        const productModels = await this.prisma.product.findMany({
            where: {
                userId: userId.value
            }
        })


        const readModels = productModels.map(p => this.mapper.toRead(p))
        return readModels
   }
}