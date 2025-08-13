import { Controller, IRequestHandler } from "@stexcore/api-engine";
import DBService from "../services/db.service";
import UserModel from "../models/user.model";
import { notFound } from "@stexcore/http-status";

/**
 * User controller
 */
export default class UserController extends Controller {

    /**
     * Get DB Service
     */
    db = this.$(DBService);
    
    /**
     * Update an user
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    PATCH: IRequestHandler = async (req, res, next) => {
        try {
            // Get model of User
            const userModel = this.db.getModel(UserModel);
            // Get user model
            const user = await userModel.findOne({
                where: {
                    id: Number(req.params.user_id)
                }
            });
            
            if(user) {
                // Apply update
                await user.update(req.body);

                res.json({
                    success: true,
                    message: "User updated!",
                    data: user.toJSON()
                });
            }
            else throw notFound("User not found!");
        }
        catch(err) {
            next(err);
        }
    };

    /**
     * Delete an user
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    DELETE: IRequestHandler = async (req, res, next) => {
        try {
            // Get model of User
            const userModel = this.db.getModel(UserModel);
            // Get user model
            const user = await userModel.findOne({
                where: {
                    id: Number(req.params.user_id)
                }
            });
            
            if(user) {
                // Apply delete
                await user.destroy();

                res.json({
                    success: true,
                    message: "User deleted!",
                    data: user.toJSON()
                });
            }
            else throw notFound("User not found!");
        }
        catch(err) {
            next(err);
        }
    };
    
}