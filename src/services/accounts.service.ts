import { Model, Op } from "sequelize";
import { Service } from "@stexcore/api-engine";
import AccountModel, { IAccount } from "../models/account.model";
import EntitiesService, { IEntityInfo } from "./entities.service";
import DBService from "./db.service";
import EntityModel, { IEntity } from "../models/entity.model";
import EmailModel from "../models/email.model";
import PhoneModel from "../models/phone.model";
import { EntityError } from "../errors/entities.error";
import { AccountError } from "../errors/accounts.error";

/**
 * Account information
 */
export interface IAccountInfo extends IAccount {
    /**
     * entity information
     */
    entity: IEntityInfo
}

/**
 * Account create information
 */
export type IAccountCreateInfo  =
    | (Omit<IAccount, "id"> & {
        /**
         * entity identifier
         */
        entity_id?: number | undefined
        /**
         * entity information
         */
        entity: Omit<IEntityInfo, "id">
    })
    | Omit<IAccount, "id">

/**
 * Account update information
 */
export interface IAccountUpdateInfo extends Omit<IAccount, "id" | "entity_id"> {
    /**
     * entity information
     */
    entity?: Omit<IEntityInfo, "id">
}

export default class AccountsService extends Service {

    public readonly db = this.$(DBService);
    public readonly Account = this.model$(AccountModel);
    public readonly Entity = this.model$(EntityModel);
    public readonly Email = this.model$(EmailModel);
    public readonly Phone = this.model$(PhoneModel);

    /**
     * Get entities service
     */
    public readonly entitiesService = this.$(EntitiesService);

    public async GetAllAccounts(): Promise<IAccountInfo[]> {
        // All Accounts
        const accounts = await this.Account.findAll({
            include: [
                {
                    model: this.Entity,
                    include: [
                        {
                            model: this.Email,
                            attributes: ["email_address"]
                        },
                        {
                            model: this.Phone,
                            attributes: ["phone"]
                        }
                    ]
                }
            ]
        }) as any as Model<IAccount & {
            entity: IEntity & {
                emails: {
                    email_address: string,
                }[],
                phones: {
                    phone: string
                }[]
            }
        }>[];

        return accounts.map((accountItem) => {
            // Data account
            const { entity, ...data } = accountItem.toJSON();

            // Map structure account info
            return {
                ...data,
                entity: {
                    ...entity,
                    emails: entity.emails.map((emailItem) => (
                        emailItem.email_address
                    )),
                    phones: entity.phones.map((phoneItem) => (
                        phoneItem.phone
                    ))
                }
            };
        });
    }

    public async GetAccount(id: number): Promise<IAccountInfo | null> {
        // Account item
        const account = await this.Account.findOne({
            where: { id },
            include: [
                {
                    model: this.Entity,
                    include: [
                        {
                            model: this.Email,
                            attributes: ["email_address"]
                        },
                        {
                            model: this.Phone,
                            attributes: ["phone"]
                        }
                    ]
                }
            ]
        }) as any as Model<IAccount & {
            entity: IEntity & {
                emails: {
                    email_address: string,
                }[],
                phones: {
                    phone: string
                }[]
            }
        }> | null;

        if(account) {
            // Data account
            const { entity, ...data } = account.toJSON();

            // Map structure account info
            return {
                ...data,
                entity: {
                    ...entity,
                    emails: entity.emails.map((emailItem) => (
                        emailItem.email_address
                    )),
                    phones: entity.phones.map((phoneItem) => (
                        phoneItem.phone
                    ))
                }
            };
        }

        return null;
    }

    public async createAccount(data: IAccountCreateInfo) {
        // Initialize transaction
        const transaction = await this.db.connection.transaction();

        try {
            let entity_id: number = -1;
            let entity: IEntityInfo | null = null;
            let entityError: EntityError | null = null;
            let another_account_with_entity: boolean = false;
            let username_used: boolean = false;

            if("entity_id" in data && !("entity" in data)) {
                entity_id = data.entity_id;
            }
            else {
                try {
                    if(typeof data.entity_id === "number") {
                        entity_id = data.entity_id;
                        await this.entitiesService.updateEntity(data.entity_id, data.entity, transaction);
                    }
                    else {
                        entity = await this.entitiesService.createEntity(data.entity, transaction);
                        entity_id = entity.id;
                    }
                }
                catch(err) {
                    if(err instanceof EntityError) {
                        entityError = err;
                    }
                    else throw err;
                }
            }

            const account_existent = await this.Account.findOne({
                where: {
                    [Op.or]: [
                        { username: data.username },
                        ...(data.entity_id ? [{ entity_id: data.entity_id }] : [])
                    ]
                }
            });

            if(account_existent) {
                another_account_with_entity = account_existent.entity_id === entity_id;
                username_used = account_existent.username === data.username;
            }

            if(
                another_account_with_entity ||
                username_used ||
                entityError
            ) {
                throw new AccountError(
                    username_used,
                    another_account_with_entity,
                    entityError ?? undefined
                );
            }
            
            // Account instance
            const account = await this.Account.create({
                ...data,
                entity_id
            }, { transaction });

            if(!entity) {
                entity = await this.entitiesService.getEntity(entity_id);
            }
    
            await transaction.commit();
            return {
                ...account.toJSON(),
                entity: entity
            };
        }
        catch(err) {
            await transaction.rollback();
            throw err;
        }
    }

    public async updateAccount(id: number, data: IAccountUpdateInfo) {
        // Initialize transaction
        const transaction = await this.db.connection.transaction();

        try {
            const account = await this.Account.findOne({
                where: { id },
                transaction
            });
            
            let nAffectedEntities = 0;

            if(account && data.entity) {
                nAffectedEntities = await this.entitiesService.updateEntity(account.entity_id, data.entity, transaction);
            }
            
            const [nAffected] = await this.Account.update(data, {
                where: { id },
                transaction
            });

            await transaction.commit();

            return nAffectedEntities + nAffected;
        }
        catch(err) {
            await transaction.rollback();
            throw err;
        }
    }

    public async deleteAccount(id: number) {
        // count deleted
        const nDeleted = await this.Account.destroy({ where: { id } });

        return nDeleted;
    }
    
}