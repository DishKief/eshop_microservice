import { PrismaClient } from "@prisma/client";

declare global {
    namespace globalThis {
        var prismadb: PrismaClient;
    }
};

// Reuse client in dev to prevent multiple instances
const prisma = global.prismadb || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prismadb = prisma;

export default prisma;