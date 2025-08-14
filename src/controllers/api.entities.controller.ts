
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
     * Get all entities
     * @param _req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    GET: IRequestHandler = async (_req, res, next) => {
        try {
            // Get all entities
            const entities = await this.entitiesService.getAllEntities();

            res.json(ok("Retrieved all entities!", entities));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Create a new entity
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    POST: IRequestHandler = async (req, res, next) => {
        try {
            // Create a new entity
            const entity = await this.entitiesService.createEntity(req.body);

            res.json(ok("Entity created!", entity));
        }
        catch(err) {
            next(err);
        }
    }

}