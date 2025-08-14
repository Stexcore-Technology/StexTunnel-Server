import { DataTypes, Model } from "sequelize";
import { ModelConstructor } from "../types/model-constructor.type";

/**
 * Interface value of model
 */
export interface IEmail {
    /**
     * Phone identifier
     */
    id: number,
    /**
     * Entity owner
     */
    entity_id: number
    /**
     * Address
     */
    email_address: string,
    /**
     * Phone verified 
     */
    verified_at: Date | null,
}

const EmailModel: ModelConstructor<IEmail, Omit<IEmail, "id">> = (connection) => {
    /**
 * Email model
 */
    class Email extends Model<IEmail, Omit<IEmail, "id">> implements IEmail {
        /**
         * Email identifier
         */
        public declare id: number;
        /**
         * Entity owner
         */
        public declare entity_id: number;
        /**
         * Address
         */
        public declare email_address: string;
        /**
         * Email verified 
         */
        public declare verified_at: Date | null;
    }

    // initialize model
    Email.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email_address: {
            type: DataTypes.CHAR(30),
            unique: true,
            allowNull: false
        },
        verified_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: connection,
        tableName: "emails",
        modelName: "email"
    });

    return Email;
}

// export model
export default EmailModel;