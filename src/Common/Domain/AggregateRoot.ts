import ConcurrencySafeEntity from "src/Common/Domain/ConcurrencySafeEntity";
import UUID4 from "src/Common/Domain/UUID4";

export default abstract class AggregateRoot<
    Id extends UUID4,
> extends ConcurrencySafeEntity<Id> {
    public abstract validatePreconditions(...args: string[]): void;
    public abstract validateInvariant(): void;
}
