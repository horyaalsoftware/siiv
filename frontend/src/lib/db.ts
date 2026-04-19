import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

function getPrismaClient() {
  if (!global.prisma) {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    global.prisma = new PrismaClient({ adapter })
  }
  return global.prisma
}

export const db = getPrismaClient()

if (process.env.NODE_ENV !== "production") global.prisma = db
