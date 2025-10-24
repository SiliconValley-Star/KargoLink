import { PrismaClient } from '@prisma/client';
declare global {
    var __prisma: PrismaClient | undefined;
}
declare let prisma: PrismaClient;
export declare const getPrismaClient: () => PrismaClient;
export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const checkDatabaseHealth: () => Promise<boolean>;
export declare const withTransaction: <T>(callback: (prisma: any) => Promise<T>) => Promise<T>;
export declare const seedDatabase: () => Promise<void>;
export default prisma;
//# sourceMappingURL=database.d.ts.map