
type CreateCommand = {
    name: string
    code: string,
    value: number
}
export default class CreateManyCommand {

    public constructor(public data: CreateCommand[]) { }
}
