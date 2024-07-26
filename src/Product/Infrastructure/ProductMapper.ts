import { Injectable } from "@nestjs/common";
import { Product } from "src/Product/Domain/Product";
import { ProductPersistenceModel } from "src/Product/Infrastructure/ProductPersistenceModel";


@Injectable()
export class ProductMapper {


    toPersistent(product: Product): ProductPersistenceModel {

        return {
            id: product.id.value,
            code: product.code.value,
            name: product.name.value,
            userId: product.userId.value,
            value: product.value.value
        }
    }
}