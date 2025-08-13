import type { Model, ModelStatic, Sequelize } from "sequelize";

/**
 * Model constructor interface
 */
export type ModelConstructor<
    /**
     * Model attributes
     */
    TModelAttributes extends {} = any, 
    /**
     * Model attributes to create instance
     */
    TCreationAttributes extends {} = TModelAttributes
> = {
    /**
     * Function constructor
     */
    (sequelize: Sequelize): ModelStatic<Model<TModelAttributes, TCreationAttributes> & TModelAttributes>
}