import { Middleware, type IRequestHandler } from "@stexcore/api-engine";
import morgan from "morgan";

// export middleware
export default class MorganMiddleware extends Middleware {
    
    /**
     * List of requests handlers
     */
    public handler: IRequestHandler[] = [

        // Morgan middleware
        morgan("dev")
    ];
    
};