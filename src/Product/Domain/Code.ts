import Result from "src/Common/Application/Result";
import ValueObject from "src/Common/Domain/ValueObject";


export default class Code extends ValueObject<string> {

    static createFromInput(code: string): Result<Code> {
        return { ok: new Code(code) }
    }

    static createFromValid(code: string): Code {
        return new Code(code)
    }
}