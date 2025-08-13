import { Controller, type IRequestHandler } from "@stexcore/api-engine";
import InfoService from "../services/info.service";

/**
 * Handle server information
 */
export default class InfoController extends Controller {

    /**
     * Information service
     */
    private info: InfoService = this.$(InfoService);

    /**
     * Handle request info API
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    public GET?: IRequestHandler = (_req, res, next) => {
        try {
            // Response information server
            res.json({
                success: true,
                message: "Information server: OK",
                data: this.info.GetInformationServer()
            });
        }
        catch(err) {
            // Forward error
            next(err);
        }
    }
    
}