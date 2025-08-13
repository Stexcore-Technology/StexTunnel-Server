import { Controller, IRequestHandler } from "@stexcore/api-engine";
import DBService from "../services/db.service";
import UserModel from "../models/user.model";

/**
 * User controller
 */
export default class UserController extends Controller {

    /**
     * Get DB Service
     */
    db = this.$(DBService);
    
    /**
     * Get all users
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    GET: IRequestHandler = async (req, res, next) => {
        try {
            // Get model of User
            const userModel = this.db.getModel(UserModel);
            // Get all users
            const allUsers = await userModel.findAll();
            
            res.json({
                success: true,
                message: "Getted all users!",
                data: allUsers.map((userItem) => userItem.toJSON())
            });
        }
        catch(err) {
            next(err);
        }
    };

    /**
     * Create a new user
     * @param req Request incomming
     * @param res Response utils
     * @param next Next middleware
     */
    POST: IRequestHandler = async (req, res, next) => {
        try {
            // Get model of User
            const userModel = this.db.getModel(UserModel);
            // Create user model
            const user = await userModel.create({
                username: req.body.username,
                password: req.body.password
            });

            res.json({
                success: true,
                message: "User created!",
                data: user.toJSON()
            });
        }
        catch(err) {
            next(err);
        }
    };
    
}