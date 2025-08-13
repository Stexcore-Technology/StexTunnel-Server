import { DataTypes, type Model } from "sequelize";
import type { ModelConstructor } from "../types/model-constructor.type";

/**
 * User interface
 */
export interface IUser {
    /**
     * User ID
     */
    id: number,
    /**
     * User name
     */
    username: string,
    /**
     * Password
     */
    password: string
}

/**
 * Create a model to User
 * @param sequelize Sequelize connection
 * @returns Model
 */
const UserModel: ModelConstructor<IUser, Omit<IUser, "id">> = (sequelize) => {

    // Define Structure model
    return sequelize.define<Model<IUser> & IUser>("User", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.CHAR(15),
            allowNull: false
        },
        password: {
            type: DataTypes.CHAR(40),
            allowNull: false
        }
    });
}

export default UserModel;