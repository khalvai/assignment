import { ProductRepository } from "src/Product/Application/Ports/Output/ProductRepository";
import Code from "src/Product/Domain/Code";
import { Product } from "src/Product/Domain/Product";


export class PostgresqlProductRepository implements ProductRepository {


    async productExistsIn(codes: Code[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async save(product: Product): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async saveAll(products: Product[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}