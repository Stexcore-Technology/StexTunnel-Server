import { type Dialect, type ModelStatic, Sequelize } from "sequelize";
import { type ModelConstructor } from "../types/model-constructor.type";
import { Service, Server, Piece } from "@stexcore/api-engine";
import EntityModel from "../models/entity.model";
import PhoneModel from "../models/phone.model";
import SessionModel from "../models/session.model";
import AccountModel from "../models/account.model";
import EmailModel from "../models/email.model";

/**
 * Declare extensions to Piece class
 */
declare module '@stexcore/api-engine' {

    /**
     * Append methods
     */
    interface Piece {
        /**
         * Quick access to get model instance
         * @param modelConstructor Model Constructor
         * @returns Model item
         */
        getModel<M extends ModelConstructor>(modelConstructor: M): ReturnType<M>;
        /**
         * Alias to quick access to get model instance
         * @param modelConstructor Model Constructor
         * @returns Model item
         */
        model$<M extends ModelConstructor>(modelConstructor: M): ReturnType<M>;
    }
    
}

// Append Method to Piece
Piece.prototype.getModel = 
Piece.prototype.model$ = (
    // Function handle to get Model instance
    function<M extends ModelConstructor>(this: Piece, modelConstructor: M) {
        // Get DB Service
        const db = this.getService(DBService);
        // Get Model
        return db.getModel(modelConstructor);
    }
);

/**
 * DBService
 */
export default class DBService extends Service {

    /**
     * Sequelize Connection
     */
    public readonly connection = new Sequelize({
        /**
         * Dialect Type
         */
        dialect:    process.env.DB_TYPE as Dialect,
        /**
         * Database
         */
        database:   process.env.DB_DATABASE!,
        /**
         * Storage info
         */
        storage:    process.env.DB_STORAGE!,
        /**
         * User connection
         */
        username:   process.env.DB_USER!,
        /**
         * Password connection
         */
        password:   process.env.DB_PASSWORD!,
        /**
         * Host connection
         */
        host:       process.env.DB_HOST!,
        /**
         * Port connection
         */
        port:       typeof process.env.DB_PORT == "string" ? Number(process.env.DB_PORT) : undefined,
        /**
         * Logs
         */
        logging: process.env.NODE_ENV === "development"
    });

    /**
     * Models instances
     */
    private models: {
        /**
         * Model instance
         */
        modelInstance: ModelStatic<any>,
        /**
         * Model constructor
         */
        modelConstructor: ModelConstructor
    }[] = [];

    /**
     * Initialize DB Service
     */
    constructor(server: Server) {
        super(server);

        // Register models
        this.registerModel(EntityModel);
        this.registerModel(PhoneModel);
        this.registerModel(EmailModel);
        this.registerModel(SessionModel);
        this.registerModel(AccountModel);

        const Entity = this.getModel(EntityModel);
        const Phone = this.getModel(PhoneModel);
        const Email = this.getModel(EmailModel);
        const Session = this.getModel(SessionModel);
        const Account = this.getModel(AccountModel);


            // initialize relation
            // Module.hasMany(RoleModulePermission, { foreignKey: "module_id", sourceKey: "id" });
            // Role.hasMany(RoleModulePermission, { foreignKey: "role_id", sourceKey: "id" });
            // Permission.hasMany(RoleModulePermission, { foreignKey: "permission_id", sourceKey: "id" });

            // RoleModulePermission.belongsTo(Module, { foreignKey: "module_id", targetKey: "id" });
            // RoleModulePermission.belongsTo(Role, { foreignKey: "role_id", targetKey: "id" });
            // RoleModulePermission.belongsTo(Permission, { foreignKey: "permission_id", targetKey: "id" });


            // Role.hasMany(Account, { foreignKey: "role_id", sourceKey: "id" });


            // Permission.hasMany(ModulePermission, { foreignKey: "permission_id", sourceKey: "id" });
            // Module.hasMany(ModulePermission, { foreignKey: "module_id", sourceKey: "id" });

            // ModulePermission.belongsTo(Permission, { foreignKey: "permission_id", targetKey: "id" });
            // ModulePermission.belongsTo(Module, { foreignKey: "module_id", targetKey: "id" });

            // Permission.belongsToMany(Module, { through: ModulePermission, foreignKey: "permission_id", sourceKey: "id", otherKey: "module_id" });
            // Module.belongsToMany(Permission, { through: ModulePermission, foreignKey: "module_id", sourceKey: "id", otherKey: "permission_id" });
            
            
            Entity.hasMany(Email, { foreignKey: "entity_id", sourceKey: "id" });
            Entity.hasMany(Phone, { foreignKey: "entity_id", sourceKey: "id" });
            Entity.hasOne(Account, { foreignKey: "entity_id", sourceKey: "id" })

            Email.belongsTo(Entity, { foreignKey: "entity_id", targetKey: "id" });

            Phone.belongsTo(Entity, { foreignKey: "entity_id", targetKey: "id" });

            Account.belongsTo(Entity, { foreignKey: "entity_id", targetKey: "id" });
            // Account.belongsTo(Role, { foreignKey: "role_id", targetKey: "id" });

        // Syncronize connection
        this.connection.sync({ });
    }

    /**
     * Get model instance
     * @param modelConstructor Model Constructor
     * @returns Model item
     */
    public getModel<M extends ModelConstructor>(modelConstructor: M): ReturnType<M> {
        // Model item
        const modelItem = this.models.find((m) => m.modelConstructor === modelConstructor);

        // Model not found!
        if(!modelItem) throw new Error("Model not found!");

        // Model item
        return modelItem.modelInstance as ReturnType<M>;
    }

    /**
     * Register model and create an instance
     * @param modelConstructor Model constructor
     */
    public registerModel(modelConstructor: ModelConstructor) {
        // Validate models conflict
        if(this.models.some((m) => m.modelConstructor === modelConstructor)) {
            throw new Error("The model is already registered!");
        }

        // Create an instance model
        this.models.push({
            modelConstructor,
            modelInstance: modelConstructor(this.connection)
        });
    }
    
}