import { initConnection } from "@/databases/init.connection"
import { Account } from "@/models/account.model"
import { Email } from "@/models/email.model";
import { Entity } from "@/models/entity.model";
import { IModule, Module } from "@/models/module.model";
import { IRole, Role } from "@/models/role.model";
import { Session } from "@/models/sessions.model";
import { Model, Op } from "sequelize";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AccountDisabledError, InvalidCredentialsError } from "@/errors/auth.error";
import { IRoleModulePermission, RoleModulePermission } from "@/models/role-module-permission.model";
import { IPermission, Permission } from "@/models/permission.model";

export interface ISignIn {
    email: string,
    password: string
}

interface IAccountInfo {
    id: number,
    username: string,
    password: string,
    enabled: boolean,
    createdAt: string,
    entity: {
        id: number,
        name: string,
        lastname: string,
        birthdate: Date,
        national_id: string,
        nationality_type: string
    },
    role: {
        id: number,
        name: string,
        description: string,
        modules: {
            name: string,
            permissions: string[]
        }[]
    }
}

export interface ISessionInfo extends Omit<IAccountInfo, "enabled" | "password"> {
    session_id: number,
    token: string,
    createdAt: string
}

interface ISessionCredential {
    version: string,
    account_id: number,
    session_id: number,
    token_uuid: string
}

export default new class authController {

    private auth_jwt_version = "auth@1.0.0";

    /**
     * Signin a user
     * @param data SignIn data
     * @throws {InvalidCredentialsError | AccountDisabledError}
     * @returns Session info
     */
    public async SignIn(data: ISignIn): Promise<ISessionInfo> {
        // Initialize connection
        await initConnection();

        const emails = await Email.findAll({
            where: {
                email_address: data.email
            }
        });

        if (!emails.length)
            throw new InvalidCredentialsError("Invalid credentials!");

        const account = await this.getAccountInfo({
            entity_ids: emails.map((eItem) => eItem.entity_id)
        });

        if (!account || account.password != data.password)
            throw new InvalidCredentialsError("Invalid credentials!")

        if (!account.enabled)
            throw new AccountDisabledError("Account is disabled!");

        const timeToExpire = 8.64e+8;
        
        const session = await Session.create({
            account_id: account.id,
            locked: false,
            expire_at: new Date(Date.now() + timeToExpire)
        });

        const credential = {
            version: this.auth_jwt_version,
            account_id: account.id,
            session_id: session.id,
            token_uuid: session.token_uuid,
        };
        const session_token = jwt.sign(credential, process.env.API_KEY || "", {
            algorithm: "HS256",
            expiresIn: timeToExpire / 1000,
            issuer: "stexcore-hub",
            audience: "stexcore-hub"
        }).toString();

        return this.getSessionInfoByModels(session_token, account, session);
    }

    public async getSessionByToken(session_token: string): Promise<ISessionInfo | null> {
        try {
            // Initialize connection
            await initConnection();
            // Decode jwt
            const decoded = jwt.verify(session_token, process.env.API_KEY || "", {
                algorithms: ["HS256"],
                issuer: "stexcore-hub",
                audience: "stexcore-hub"
            }) as ISessionCredential;

            const session = await Session.findOne({
                where: {
                    id: decoded.session_id,
                    token_uuid: decoded.token_uuid
                }
            });

            if (!session) return null;

            const account = await this.getAccountInfo({ account_id: [session.account_id] });

            if(account) {
                return this.getSessionInfoByModels(session_token, account, session);
            }
            throw new InvalidCredentialsError("Invalid credentials!");
        }
        catch (err) {
            if(err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
                throw new InvalidCredentialsError("Invalid credentials!");
            }
            throw err;
        }
    }

    public async Logout(session_token: string): Promise<void> {
        // Initialize connection
        await initConnection();

        const session = await this.getSessionByToken(session_token);

        if(session) {
            const [nUpdated] = await Session.update({
                locked: true
            }, {
                where: {
                    id: session.session_id,
                    token_uuid: session.token,
                    account_id: session.id
                }
            });

            if(nUpdated) {
                return;
            }
        }
        throw new InvalidCredentialsError("Invalid credentials!");
    }

    private async getAccountInfo(where: { entity_ids: number[] } | { account_id: number[] }): Promise<IAccountInfo | null> {
        const account = await Account.findOne({
            attributes: [
                "id",
                "username",
                "password",
                "enabled",
                "createdAt"
            ],
            where: {
                [Op.or]:
                    "entity_ids" in where ? (
                        where.entity_ids.map((entity_id) => ({
                            entity_id: entity_id
                        }))
                    ) : (
                        where.account_id.map((account_id) => ({
                            id: account_id
                        }))
                    )
            },
            include: [
                {
                    model: Entity,
                    attributes: [
                        "id",
                        "name",
                        "lastname",
                        "birthdate",
                        "national_id",
                        "nationality_type"
                    ]
                },
                {
                    model: Role,
                    attributes: [
                        "id",
                        "name",
                        "description"
                    ],
                    include: [
                        {
                            model: RoleModulePermission,
                            include: [
                                Module,
                                Permission
                            ]
                        }
                    ]
                }
            ]
        }) as any as (Model<{
                id: number,
                username: string,
                password: string,
                enabled: boolean,
                createdAt: string,
                entity: {
                    id: number,
                    name: string,
                    lastname: string,
                    birthdate: Date,
                    national_id: string,
                    nationality_type: string
                },
                role: IRole & {
                    role_module_permissions: IRoleModulePermission & {
                        module: IModule,
                        permission: IPermission
                    }[]
                }
        }>) | null;

        if(account) {
            const json = account.toJSON();

            const modules: IAccountInfo["role"]["modules"] = [];

            for(const roleModulePermission of json.role.role_module_permissions) {
                let moduleItem = modules.find((m) => m.name === roleModulePermission.module.name);

                if(!moduleItem) {
                    modules.push(moduleItem = { name: roleModulePermission.module.name, permissions: [] });
                }

                if(!moduleItem.permissions.includes(roleModulePermission.permission.name)) {
                    moduleItem.permissions.push(roleModulePermission.permission.name);
                }
            }

            return {
                id: json.id,
                username: json.username,
                password: json.password,
                enabled: json.enabled,
                createdAt: json.createdAt,
                entity: json.entity,
                role: {
                    id: json.role.id,
                    name: json.role.name,
                    description: json.role.description,
                    modules: modules
                }
            };
        }
        return null;
    }

    private getSessionInfoByModels(token: string, account: IAccountInfo, session: Session): ISessionInfo {
        return {
            id: account.id,
            session_id: session.id,
            token: token,
            username: account.username,
            entity: account.entity,
            role: account.role,
            createdAt: String(account.createdAt)
        };
    }

    // public async SignUp(data: ISignUp) {
    //     // Initialize connection sequelize
    //     await initConnection();
    // }

}