
import { Controller, IRequestHandler } from "@stexcore/api-engine";
import EntitiesService from "../services/entities.service";
import { notFound, ok } from "@stexcore/http-status";

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
            const entity_id = Number(req.params.id);
            // Get Entity
            const entity = await this.entitiesService.getEntity(entity_id);

            // if not deleted? notify not found
            if (!entity) {
                throw notFound("Entity '" + entity_id + "' not found!");
            }

            // response entity item
            res.json(ok("Retrieved entity!", entity));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Update a entity
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    PUT: IRequestHandler = async (req, res, next) => {
        try {
            const entity_id = Number(req.params.id);
            // update entity
            const nUpdated = await this.entitiesService.updateEntity(entity_id, req.body);

            // if not updated? notify not found
            if (!nUpdated) {
                throw notFound("Entity '" + entity_id + "' not found!");
            }

            // response updated
            res.json(ok("Entity updated!"));
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Delete entity
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    DELETE: IRequestHandler = async (req, res, next) => {
        try {
            const entity_id = Number(req.params.id);
            // deleted entity
            const nDeleted = await this.entitiesService.deleteEntity(entity_id);

            // if not deleted? notify not found
            if (!nDeleted) {
                throw notFound("Entity '" + entity_id + "' not found!");
            }

            // response deleted
            res.json(ok("Entity deleted!"));
        }
        catch (err) {
            next(err);
        }
    }

}