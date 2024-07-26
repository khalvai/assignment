import Result from "src/Common/Application/Result";
import ValueObject from "src/Common/Domain/ValueObject";


export class Name extends ValueObject<string> {


    static createFromInput(name: string): Result<Name> {
        // logic goes here for creating
        return { ok: new Name(name) }
    }

    static createFromValid(name: string): Name {
        return new Name(name)
    }


}