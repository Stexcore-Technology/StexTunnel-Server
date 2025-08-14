import { DataTypes, Model } from "sequelize";
import { ModelConstructor } from "../types/model-constructor.type";

/**
 * Interface value of model
 */
export interface IAccount {
    /**
     * Module identifier
     */
    id: number,
    /**
     * Entity identifier
     */
    entity_id: number
    /**
     * Role identifier
     */
    role_id: number
    /**
     * User name
     */
    username: string,
    /**
     * Password
     */
    password: string
    /**
     * Enabled account
     */
    enabled: boolean
}

const AccountModel: ModelConstructor<IAccount, Omit<IAccount, "id">> = (connection) => {
    /**
 * Account model
 */
    class Account extends Model<IAccount, Omit<IAccount, "id">> implements IAccount {
        /**
         * Module identifier
         */
        public declare id: number;
        /**
         * Entity identifier
         */
        public declare entity_id: number;
        /**
         * Role identifier
         */
        public declare role_id: number;
        /**
         * User name
         */
        public declare username: string;
        /**
         * Password
         */
        public declare password: string;
        /**
         * Enabled account
         */
        public declare enabled: boolean;
    }

    // initialize model
    Account.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity_id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        username: {
            type: DataTypes.CHAR(20),
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.CHAR(100),
            allowNull: false
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        sequelize: connection,
        tableName: "accounts",
        modelName: "account"
    });

    return Account;
}

// export model
export default AccountModel;