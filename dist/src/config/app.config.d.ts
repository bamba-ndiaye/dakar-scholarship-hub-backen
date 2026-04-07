declare const _default: () => {
    app: {
        nodeEnv: string;
        port: number;
        apiPrefix: string;
        appUrl: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    cloudinary: {
        folder: string;
        cloudName: string | undefined;
        apiKey: string | undefined;
        apiSecret: string | undefined;
    };
};
export default _default;
