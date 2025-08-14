import { DataTypes, Model } from "sequelize";
import { ModelConstructor } from "../types/model-constructor.type";

/**
 * Interface value of model
 */
interface IPhone {
    /**
     * Phone identifier
     */
    id: number,
    /**
     * Entity owner
     */
    entity_id: number
    /**
     * Phone
     */
    phone: string,
    /**
     * Phone verified 
     */
    verified_at: Date | null,
}

const PhoneModel: ModelConstructor<IPhone, Omit<IPhone, "id">> = (connection) => {
    /**
 * Phone model
 */
    class Phone extends Model<IPhone, Omit<IPhone, "id">> implements IPhone {
        /**
         * Phone identifier
         */
        public declare id: number;
        /**
         * Entity owner
         */
        public declare entity_id: number;
        /**
         * Phone
         */
        public declare phone: string;
        /**
         * Phone verified 
         */
        public declare verified_at: Date | null;
    }

    // initialize model
    Phone.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        phone: {
            type: DataTypes.CHAR(15),
            unique: true,
            allowNull: false
        },
        verified_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: connection,
        tableName: "phones",
        modelName: "phone"
    });

    return Phone;
}

// export model
export default PhoneModel;