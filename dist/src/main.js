"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express = __importStar(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
function buildAllowedOrigins(appUrl) {
    const defaults = [
        'http://localhost:5173',
        'https://dakar-scholarship-hub-mains.vercel.app',
        'https://dakar-scholarship-hub-front.vercel.app',
    ];
    const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
    const configured = (appUrl ?? '')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);
    return Array.from(new Set([...defaults.map(normalizeOrigin), ...configured]));
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix(configService.get('app.apiPrefix', 'api/v1'));
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'uploads')));
    const allowedOrigins = buildAllowedOrigins(configService.get('app.appUrl'));
    app.enableCors({
        origin: (origin, callback) => {
            const normalizedOrigin = origin?.replace(/\/+$/, '');
            if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Dakar Scholarship Hub API')
        .setDescription('API REST securisee pour la gestion des bourses de Dakar')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = configService.get('app.port', 4000);
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map