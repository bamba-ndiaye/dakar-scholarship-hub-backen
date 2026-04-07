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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const fs_1 = require("fs");
const path_1 = require("path");
const prisma = new client_1.PrismaClient();
function loadDotEnvFile() {
    const envPath = (0, path_1.join)(process.cwd(), '.env');
    if (!(0, fs_1.existsSync)(envPath)) {
        return;
    }
    const content = (0, fs_1.readFileSync)(envPath, 'utf-8');
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}
async function main() {
    loadDotEnvFile();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminEmail || !adminPassword) {
        console.log('Seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
        return;
    }
    if (adminPassword.length < 8) {
        throw new Error('ADMIN_PASSWORD must contain at least 8 characters.');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            firstName: process.env.ADMIN_FIRST_NAME?.trim() || 'Admin',
            lastName: process.env.ADMIN_LAST_NAME?.trim() || 'Principal',
            password: hashedPassword,
            phone: process.env.ADMIN_PHONE?.trim() || null,
            address: process.env.ADMIN_ADDRESS?.trim() || null,
            role: client_1.Role.ADMIN,
        },
        create: {
            firstName: process.env.ADMIN_FIRST_NAME?.trim() || 'Admin',
            lastName: process.env.ADMIN_LAST_NAME?.trim() || 'Principal',
            email: adminEmail,
            password: hashedPassword,
            phone: process.env.ADMIN_PHONE?.trim() || null,
            address: process.env.ADMIN_ADDRESS?.trim() || null,
            role: client_1.Role.ADMIN,
        },
    });
    console.log(`Admin seed complete: ${admin.email}`);
}
main()
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map