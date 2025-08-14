
import { Model, Op, Transaction } from "sequelize";
import { EntityError } from "../errors/entities.error";
import { Service } from "@stexcore/api-engine";
import EntityModel, { IEntity } from "../models/entity.model";
import EmailModel from "../models/email.model";
import PhoneModel from "../models/phone.model";
import DBService from "../services/db.service";

/**
 * Entity information
 */
export interface IEntityInfo extends IEntity {
    /**
     * Emails owner
     */
    emails: string[],
    /**
     * Phones owner
     */
    phones: string[]
}

/**
 * Entities controller
 */
export default class EntitiesService extends Service {

    public readonly db = this.$(DBService);
    public readonly Entity = this.model$(EntityModel);
    public readonly Email = this.model$(EmailModel);
    public readonly Phone = this.model$(PhoneModel);

    /**
     * Get all entities
     * @returns All entities information
     */
    public async getAllEntities(): Promise<IEntityInfo[]> {
        // All entities
        const entities = await this.Entity.findAll({
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
        }) as any as Model<IEntity & {
            emails: {
                email_address: string,
            }[],
            phones: {
                phone: string
            }[]
        }>[];

        return entities.map((entityItem) => {
            // Data entity
            const { emails, phones, ...data } = entityItem.toJSON();

            // Map structure entity info
            return {
                ...data,
                emails: emails.map((emailItem) => (
                    emailItem.email_address
                )),
                phones: phones.map((phoneItem) => (
                    phoneItem.phone
                ))
            };
        });
    }

    public async getEntity(id: number): Promise<IEntityInfo | null> {
        // entity instance
        const entity = await this.Entity.findOne({
            where: { id },
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
        }) as any as Model<IEntity & {
            emails: {
                email_address: string,
            }[],
            phones: {
                phone: string
            }[]
        }> | null;

        // if exists, map structure
        if (entity) {
            const { emails, phones, ...data } = entity.toJSON();

            return {
                ...data,
                emails: emails.map((emailItem) => emailItem.email_address),
                phones: phones.map((phoneItem) => phoneItem.phone)
            };
        }

        return null;
    }

    public async searchEntitiesByDNI(dni: string): Promise<IEntityInfo[]> {
        // Get structure data dni
        let [nationality_type, national_id] = dni.split("-") as [string | undefined, string];

        // Validate structure data
        if (typeof national_id !== "string") {
            national_id = nationality_type || ""; // get national id
            nationality_type = undefined; // remove value of nationality type

            if (/^[A-Za-z]/.test(national_id)) {
                nationality_type = national_id.substring(0, 1);
                national_id = national_id.substring(1);
            }
        }

        // All entity
        const entity = await this.Entity.findAll({
            include: [
                {
                    model: this.Email,
                    attributes: ["email_address"]
                },
                {
                    model: this.Phone,
                    attributes: ["phone"]
                }
            ],
            where: {
                ...(typeof nationality_type === "string" && { nationality_type: nationality_type }),
                national_id: national_id
            }
        }) as any as Model<IEntity & {
            emails: {
                email_address: string,
            }[],
            phones: {
                phone: string
            }[]
        }>[];

        return entity.map((entityItem) => {
            // Data entity
            const { emails, phones, ...data } = entityItem.toJSON();

            // Map structure entity info
            return {
                ...data,
                emails: emails.map((emailItem) => (
                    emailItem.email_address
                )),
                phones: phones.map((phoneItem) => (
                    phoneItem.phone
                ))
            };
        });
    }

    public async createEntity(data: Omit<IEntityInfo, "id">, transaction?: Transaction): Promise<IEntityInfo> {
        // transaction
        let transactionCreated: Transaction | undefined;

        if (!transaction) {
            // Create transaction
            transactionCreated = transaction = await this.db.connection.transaction();
        }

        try {
            const [
                another_entity,
                emails_existent,
                phones_existent
            ] = await Promise.all([
                this.Entity.findOne({
                    where: {
                        national_id: data.national_id,
                        nationality_type: data.nationality_type
                    },
                    transaction
                }),
                this.Email.findAll({
                    where: {
                        email_address: {
                            [Op.in]: data.emails
                        }
                    },
                    transaction
                }),
                this.Phone.findAll({
                    where: {
                        phone: {
                            [Op.in]: data.phones
                        }
                    },
                    transaction
                })
            ]);

            // Emails address used
            const emails_used = emails_existent
                .filter((eItem) => (
                    data.emails.includes(eItem.email_address)
                ))
                .map((eItem) => (
                    eItem.email_address
                ));

            // Phones address used
            const phones_used = phones_existent
                .filter((pItem) => (
                    data.phones.includes(pItem.phone)
                ))
                .map((pItem) => (
                    pItem.phone
                ));

            // Validate if some record is used
            if (emails_used.length || phones_used.length || another_entity) {
                throw new EntityError(
                    !!another_entity,
                    emails_used,
                    phones_used
                );
            }

            // Create a entity instance
            const entity = await this.Entity.create(data, { transaction });

            // Creat emails and phones relation
            const [
                emails,
                phones
            ] = await Promise.all([
                // Create emails
                this.Email.bulkCreate(
                    data.emails.map((emailItem) => ({
                        entity_id: entity.id,
                        email_address: emailItem,
                        verified_at: null
                    })),
                    { transaction }
                ),
                // Create phones
                this.Phone.bulkCreate(
                    data.phones.map((phoneItem) => ({
                        entity_id: entity.id,
                        phone: phoneItem,
                        verified_at: null
                    })),
                    { transaction }
                )
            ]);

            if (transactionCreated) {
                // Commit transaction
                await transactionCreated.commit();
            }

            // entity instance
            return {
                ...entity.toJSON(),
                emails: emails.map((e) => e.email_address),
                phones: phones.map((p) => p.phone)
            };
        }
        catch (err) {
            if (transactionCreated) {
                await transactionCreated.rollback();
            }
            throw err;
        }
    }

    public async updateEntity(id: number, data: Omit<IEntityInfo, "id">, transaction?: Transaction) {
        // Init transaction
        let createdTransaction: Transaction | null = null;

        if (!transaction) {
            createdTransaction = transaction = await this.db.connection.transaction();
        }

        try {
            const [emails, phones] = await Promise.all([
                this.Email.findAll({
                    where: {
                        entity_id: id
                    },
                    transaction
                }),
                this.Phone.findAll({
                    where: {
                        entity_id: id
                    },
                    transaction
                })
            ]);

            // Prepare emails to create and delete
            const emails_to_delete = emails.filter((eItem) => (
                !data.emails.includes(eItem.email_address)
            ));
            const emails_to_create = data.emails.filter((e) => (
                emails.every((eItem) => eItem.email_address !== e)
            ));

            // Prepare phones to create and delete
            const phones_to_delete = phones.filter((pItem) => (
                !data.phones.includes(pItem.phone)
            ));
            const phones_to_create = data.phones.filter((p) => (
                phones.every((pItem) => pItem.phone !== p)
            ));

            // Get conflict info
            const [
                another_entity,
                emails_existent,
                phones_existent
            ] = await Promise.all([
                // Another entity
                this.Entity.findOne({
                    where: {
                        id: {
                            [Op.not]: id
                        },
                        national_id: data.national_id,
                        nationality_type: data.nationality_type
                    },
                    transaction
                }),
                // Emails used by another entity
                this.Email.findAll({
                    where: {
                        entity_id: {
                            [Op.not]: id
                        },
                        email_address: {
                            [Op.in]: emails_to_create.map((email) => (
                                email
                            ))
                        }
                    },
                    transaction
                }),
                // Phones used by another entity
                this.Phone.findAll({
                    where: {
                        entity_id: {
                            [Op.not]: id
                        },
                        phone: {
                            [Op.in]: phones_to_create.map((phone) => (
                                phone
                            ))
                        }
                    },
                    transaction
                })
            ]);

            // Map structure emails and phones
            const emails_used = emails_existent.map((e) => e.email_address);
            const phones_used = phones_existent.map((p) => p.phone);

            // Validate if some record is used
            if (emails_used.length || phones_used.length || another_entity) {
                throw new EntityError(
                    !!another_entity,
                    emails_used,
                    phones_used
                );
            }

            const [
                [nUpdated],
                nEmailsDeleted,
                nEmailsCreated,
                nPhonesDeleted,
                nPhonesCreated
            ] = await Promise.all([
                // Update entity
                this.Entity.update(data, {
                    where: { id },
                    transaction
                }),
                // Destroy emails
                emails_to_delete.length && this.Email.destroy({
                    where: {
                        id: {
                            [Op.in]: emails_to_delete.map((e) => e.id)
                        }
                    },
                    transaction
                }),
                // Create emails
                emails_to_create.length && this.Email.bulkCreate(
                    emails_to_create.map((eItem) => ({
                        entity_id: id,
                        email_address: eItem,
                        verified_at: null
                    })),
                    { transaction }
                ).then((emails) => emails.length),
                // Delete phones
                phones_to_delete.length && this.Phone.destroy({
                    where: {
                        id: {
                            [Op.in]: phones_to_delete.map((p) => p.id)
                        }
                    },
                    transaction
                }),
                // Create phones
                phones_to_create.length && this.Phone.bulkCreate(
                    phones_to_create.map((phone) => ({
                        entity_id: id,
                        phone: phone,
                        verified_at: null
                    })),
                    { transaction }
                ).then((phones) => phones.length)
            ]);

            if (createdTransaction) {
                await createdTransaction.commit();
            }

            return Number(!!(nUpdated + nEmailsDeleted + nEmailsCreated + nPhonesDeleted + nPhonesCreated));
        }
        catch (err) {
            if (createdTransaction) {
                await createdTransaction.rollback();
            }
            throw err;
        }
    }

    public async deleteEntity(id: number) {
        // Initialize transaction
        const transaction = await this.db.connection.transaction();

        try {
            const [
                nEmailsDeleted,
                nPhonesDeleted
            ] = await Promise.all([
                // Delete emails
                this.Email.destroy({
                    where: {
                        entity_id: id
                    },
                    transaction
                }),
                // delete phones
                this.Phone.destroy({
                    where: {
                        entity_id: id
                    },
                    transaction
                })
            ]);

            // Delete entity
            const nEntitiesDeleted = await this.Entity.destroy({
                where: { id },
                transaction
            });

            // Commit transaction
            await transaction.commit();

            return !!(nEntitiesDeleted + nEmailsDeleted + nPhonesDeleted)
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

}