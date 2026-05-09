import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Read .env file directly
const envPath = path.join(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse DATABASE_URL from .env file
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
const DATABASE_URL = databaseUrlMatch ? databaseUrlMatch[1] : ''

console.log('🔗 DATABASE_URL from .env:', DATABASE_URL ? 'Found' : 'NOT FOUND')
console.log('')

// Create PrismaClient with explicit database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')

    // Test database connection
    const userCount = await prisma.user.count()
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    console.log('✅ Database connection successful!')
    console.log('👥 Total users:', userCount)
    console.log('🔑 Admin user:', adminUser?.email || 'Not found')
    console.log('👤 Admin name:', adminUser?.name || 'N/A')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)

    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
