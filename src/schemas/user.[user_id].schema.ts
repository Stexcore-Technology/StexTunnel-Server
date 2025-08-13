import { createSchema, joi } from "@stexcore/api-engine";

/**
 * Reusable user_id validation schema.
 * Ensures the ID is a string composed only of digits.
 */
const userIdSchema = joi
    .string()
    .pattern(/^\d+$/)
    .message("user_id must be a numeric string");

/**
 * Schema definition for PATCH and DELETE operations on users.
 * PATCH allows partial field updates.
 * DELETE removes a user by their numeric ID.
 */
export default createSchema({

    /**
     * PATCH /user/:user_id
     * Accepts optional `username` or `password` fields.
     * Validates that the user_id is numeric.
     */
    PATCH: {
        // Validate route parameters
        params: joi.object({
            user_id: userIdSchema
        }),
        // Validate request body with at least one field present
        body: joi.object({
            username: joi.string().optional(),
            password: joi.string().optional()
        }).min(1) // Disallow empty PATCH body
    },

    /**
     * DELETE /user/:user_id
     * Removes user by validated numeric ID.
     */
    DELETE: {
        // Validate route parameters
        params: joi.object({
            user_id: userIdSchema
        })
        // No body is expected
    }

})