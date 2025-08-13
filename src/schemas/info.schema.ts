import { createSchema, joi } from "@stexcore/api-engine";

export default createSchema({
    
    /**
     * Get infomation schema
     */
    GET: {
        /**
         * Method GET
         */
        query: joi.object({ })
    }

});