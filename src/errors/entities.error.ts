/**
 * Class error create Entity
 */
export class EntityError extends Error {
    /**
     * Constructor error create entity
     * @param duplicated_national_id Flag to indicate a duplicated national id
     * @param emails_used Emails used by another entity
     * @param phones_used Phones used by another entity
     */
    constructor(
        public readonly duplicated_national_id: boolean,
        public readonly emails_used: string[],
        public readonly phones_used: string[],
    ) {
        super("Error to create a new entity");
    }
}