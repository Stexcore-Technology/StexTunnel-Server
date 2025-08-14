import { DataTypes, Model } from "sequelize";
import { ModelConstructor } from "../types/model-constructor.type";

/**
 * Interface value of model
 */
interface ISession {
    /**
     * Session identifier
     */
    id: number,
    /**
     * Account identifier
     */
    account_id: number,
    /**
     * Session Token
     */
    token_uuid: string,
    /**
     * Locked
     */
    locked: boolean,
    /**
     * Expire at
     */
    expire_at: Date,
}

const SessionModel: ModelConstructor<ISession, Omit<ISession, "id" | "token_uuid">> = (connection) => {
    /**
     * Account model
     */
    class Session extends Model<ISession, Omit<ISession, "id" | "token_uuid">> implements ISession {
        /**
         * Session identifier
         */
        public declare id: number;
        /**
         * Account identifier
         */
        public declare account_id: number;
        /**
         * Session Token
         */
        public declare token_uuid: string;
        /**
         * Locked
         */
        public declare locked: boolean;
        /**
         * Expire at
         */
        public declare expire_at: Date;
    }

    // initialize model
    Session.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token_uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        locked: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        expire_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize: connection,
        tableName: "sessions",
        modelName: "session"
    });

    return Session;
}

// export model
export default SessionModel;