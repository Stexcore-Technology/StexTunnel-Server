import { DataTypes, Model } from "sequelize";
import { ModelConstructor } from "../types/model-constructor.type";

/**
 * Interface value of model
 */
export interface IEntity {
    /**
     * Entity identifier
     */
    id: number,
    /**
     * Entity name
     */
    name: string
    /**
     * Entity lastname
     */
    lastname: string,
    /**
     * Entity birthdate or creation date of company
     */
    birthdate: Date,
    /**
     * Entity national id
     */
    national_id: string,
    /**
     * nationality type
     */
    nationality_type: string
}


const EntityModel: ModelConstructor<IEntity, Omit<IEntity, "id">> = (connection) => {
    /**
     * Entity model
     */
    class Entity extends Model<IEntity, Omit<IEntity, "id"> > implements IEntity {
        /**
         * Entity identifier
         */
        public declare id: number;
        /**
         * Entity name
         */
        public declare name: string;
        /**
         * Entity lastname
         */
        public declare lastname: string;
        /**
         * Entity birthdate 
         */
        public declare birthdate: Date;
        /**
         * Entity national id
         */
        public declare national_id: string;
        /**
         * nationality type
         */
        public declare nationality_type: string;
    }
    
    // initialize model
    Entity.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.CHAR(40),
            allowNull: false,
        },
        lastname: {
            type: DataTypes.CHAR(40),
            allowNull: false,
        },
        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        national_id: {
            type: DataTypes.CHAR(15),
            allowNull: false
        },
        nationality_type: {
            type: DataTypes.CHAR(1),
            allowNull: false
        }
    }, {
        sequelize: connection,
        tableName: "entities",
        modelName: "entity",
        indexes: [
            {
                unique: true,
                fields: ["national_id", "nationality_type"]
            }
        ]
    });

    return Entity;
}

// export model
export default EntityModel;