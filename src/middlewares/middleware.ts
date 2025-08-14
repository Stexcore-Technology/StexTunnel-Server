import { IMiddlewareError, Middleware, type IRequestHandler } from "@stexcore/api-engine";
import morgan from "morgan";
import { EntityError } from "../errors/entities.error";
import { conflict } from "@stexcore/http-status";

// export middleware
export default class MorganMiddleware extends Middleware {
    
    /**
     * List of requests handlers
     */
    public handler: IRequestHandler[] = [

        // Morgan middleware
        morgan("dev")
    ];

    error?: IMiddlewareError = [
        (err, req, res, next) => {
            try {
                if(err instanceof EntityError) {
                    // Conflict found
                    throw conflict(
                        "Conflicts encountered!",
                        {
                            emails_used: err.emails_used,
                            phones_used: err.phones_used,
                            duplicated_national_id: err.duplicated_national_id
                        }
                    );
                }
                console.error(err);
                throw err;
            }
            catch(err) {
                next(err);
            }
        }
    ]
    
};