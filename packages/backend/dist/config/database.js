"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.withTransaction = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = exports.getPrismaClient = void 0;
const client_1 = require("@prisma/client");
const environment_1 = require("./environment");
let prisma;
const createPrismaClient = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    if (environment_1.config.nodeEnv === 'production') {
        return new client_1.PrismaClient({
            log: ['error'],
            errorFormat: 'minimal',
        });
    }
    else {
        return new client_1.PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
            errorFormat: 'pretty',
        });
    }
};
if (environment_1.config.nodeEnv === 'production') {
    prisma = createPrismaClient();
}
else {
    if (!global.__prisma) {
        global.__prisma = createPrismaClient();
    }
    prisma = global.__prisma;
}
async function gracefulShutdown() {
    try {
        await prisma.$disconnect();
        console.log('📦 Database connection closed');
    }
    catch (error) {
        console.error('❌ Error during database shutdown:', error);
    }
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
const getPrismaClient = () => {
    return prisma;
};
exports.getPrismaClient = getPrismaClient;
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await prisma.$disconnect();
};
exports.disconnectDatabase = disconnectDatabase;
const checkDatabaseHealth = async () => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const withTransaction = async (callback) => {
    return await prisma.$transaction(callback);
};
exports.withTransaction = withTransaction;
const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');
        console.log('✅ Database seeded successfully');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
exports.default = prisma;
//# sourceMappingURL=database.js.map