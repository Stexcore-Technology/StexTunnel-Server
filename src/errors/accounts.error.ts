import { EntityError } from "./entities.error";

/**
 * Class error create Account
 */
export class AccountError extends Error {
    /**
     * Constructor error
     * @param username_used used by another account
     * @param entityError details error of entity Error
     */
    constructor(
        public readonly username_used: boolean,
        public readonly another_account_with_entity: boolean,
        public readonly entityError?: EntityError
    ) {
        super("Error to create/update an account");
    }
}