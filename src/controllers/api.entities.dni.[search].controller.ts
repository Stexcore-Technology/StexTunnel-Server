
import { Controller, IRequestHandler } from "@stexcore/api-engine";
import EntitiesService from "../services/entities.service";
import { ok } from "@stexcore/http-status";

/**
 * Entities controller
 */
export default class EntitiesController extends Controller {

    /**
     * Get entities service
     */
    public readonly entitiesService = this.$(EntitiesService);

    /**
     * Get an entity
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    public GET: IRequestHandler = async (req, res, next) => {
        try {
            // all entities
            const entities = await this.entitiesService.searchEntitiesByDNI(req.params.search);

            // response entities
            res.json(
                ok(
                    entities.length + " " + (entities.length == 1 ? "entity" : "entities") + " found!",
                    entities
                )
            );
        }
        catch (err) {
            next(err);
        }
    }

}