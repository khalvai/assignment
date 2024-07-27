import { Injectable } from "@nestjs/common";
import Code from "src/Product/Domain/Code";
import Id from "src/Product/Domain/Id";
import { Product } from "src/Product/Domain/Product";
import { UserId } from "src/Product/Domain/UserId";
import { Value } from "src/Product/Domain/Value";
import { ProductReadModel } from "src/Product/Infrastructure/Models/ProductReadModel";
import { ProductPersistenceModel } from "src/Product/Infrastructure/ProductPersistenceModel";
import Name from "src/User/Domain/Name";


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

    toRead(persistenceModel: ProductPersistenceModel): ProductReadModel {
        return { code: persistenceModel.name, value: persistenceModel.value, name: persistenceModel.name }
    }

    toDomain(persistenceModel: ProductPersistenceModel): Product {

        const product = new Product()
        product.id = Id.fromValid(persistenceModel.id)
        product.code = Code.createFromValid(persistenceModel.code)
        product.name = Name.createFromValid(persistenceModel.name)
        product.value = Value.createFromValid(persistenceModel.value)
        product.userId = UserId.createFromValid(persistenceModel.userId)

        return product

    }
}