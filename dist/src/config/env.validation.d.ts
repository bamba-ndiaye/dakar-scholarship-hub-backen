declare class EnvironmentVariables {
    NODE_ENV?: string;
    PORT?: number;
    API_PREFIX?: string;
    APP_URL?: string;
    BACKEND_URL?: string;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN?: string;
    JWT_REFRESH_EXPIRES_IN?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_FOLDER?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    ADMIN_FIRST_NAME?: string;
    ADMIN_LAST_NAME?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_PHONE?: string;
    ADMIN_ADDRESS?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
