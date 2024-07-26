import Code from "src/Product/Domain/Code";
import { Product } from "src/Product/Domain/Product";


export interface ProductRepository {

    productExistsIn(codes: Code[]): Promise<boolean>
    save(product: Product): Promise<void>
    saveAll(products: Product[]): Promise<void>

}