import { createSchema, joi } from "@stexcore/api-engine";

/**
 * Schema definition for user creation via POST /user.
 * Requires both `username` and `password` as non-empty strings.
 */
export default createSchema({

    /**
     * POST /user
     * Validates the request body to ensure required fields are present.
     */
    POST: {
        // Validate required body fields
        body: joi.object({
            username: joi
                .string()
                .required(), // username must be a non-empty string
            password: joi
                .string()
                .required()  // password must be a non-empty string
        })
    }

    // Optional: Add extra validation if needed
    // password: joi.string().min(8).regex(/[A-Z]/).message("Password must contain at least one uppercase letter")
})