import { Pipe, type IRequestHandler } from "@stexcore/api-engine";
import { static as Static, json, urlencoded } from "express";
import path from "path";

// export pipe
export default class MorganPipe extends Pipe {
    
    /**
     * List of requests handlers
     */
    public handler: IRequestHandler[] = [

        // UrlEncoded
        urlencoded({ extended: true }),

        // Json Parser
        json(),
        
        // Static pipe
        Static(path.join(process.cwd(), "public"))
    ]
    
};