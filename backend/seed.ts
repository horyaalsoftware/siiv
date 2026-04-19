import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { hashPassword } from './src/services/auth.service'
import dotenv from 'dotenv'

dotenv.config()

// Required for Neon WebSocket connection in Node.js (if we were using serverless driver)
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables')
}
console.log('📡 Connecting to:', connectionString.split('@')[1])

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Starting Advanced Multi-tenant seed process...')

  // 1. Create GLOBAL Platform Admin (No companyId)
  const hashedSuperPassword = await hashPassword('root123')
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@siiv.com' },
    update: { passwordHash: hashedSuperPassword },
    create: {
      name: 'Global Platform Admin',
      email: 'superadmin@siiv.com',
      passwordHash: hashedSuperPassword,
      role: Role.PLATFORM_ADMIN,
      status: 'ACTIVE',
    },
  })
  console.log(`✅ PLATFORM_ADMIN created: ${superAdmin.email}`)

  // 2. Create Default Company (The first Tenant)
  const company = await prisma.company.upsert({
    where: { email: 'admin@horyaal.com' },
    update: {},
    create: {
      name: 'Horyaal Software',
      email: 'admin@horyaal.com',
      phone: '+252 61xxxxxxx',
    },
  })
  console.log(`✅ Tenant Company: ${company.name}`)

  // 3. Create Tenant Admin (Bound to Horyaal Software)
  const hashedAdminPassword = await hashPassword('admin123')
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@horyaal.com' },
    update: { 
      passwordHash: hashedAdminPassword,
      companyId: company.id 
    },
    create: {
      name: 'Company Admin',
      email: 'admin@horyaal.com',
      passwordHash: hashedAdminPassword,
      role: Role.COMPANY_ADMIN,
      status: 'ACTIVE',
      companyId: company.id,
    },
  })
  console.log(`✅ COMPANY_ADMIN created: ${tenantAdmin.email} for ${company.name}`)

  // 4. Initialize Tenant Configuration
  await prisma.tenantConfig.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      constructionEnabled: true,
    },
  })
  console.log(`✅ Tenant configuration initialized for ${company.name}`)

  // 5. Create Sample Projects for the Tenant
  const projectCount = await prisma.project.count({
    where: { companyId: company.id }
  })

  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          name: 'Real Estate Portal',
          location: 'Dubai',
          budget: 250000,
          status: 'IN_PROGRESS',
          companyId: company.id,
        },
        {
          name: 'Utility Billing System',
          location: 'Mogadishu',
          budget: 120000,
          status: 'COMPLETED',
          companyId: company.id,
        }
      ]
    })
    console.log(`✅ Sample projects added for ${company.name}`)
  }

  // 6. Link Auth Account for Super Admin
  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: 'credentials', providerAccountId: superAdmin.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: superAdmin.id,
    }
  })
  console.log(`✅ Auth account linked for Super Admin`)

  console.log('✨ Advanced Multi-tenant seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
