import { PrismaClient } from "./generated/prisma"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export const client = prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma