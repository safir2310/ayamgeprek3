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

async function listUsers() {
  try {
    console.log('👥 Listing all users...')
    console.log('')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        memberLevel: true,
        points: true,
      }
    })

    console.log(`Total users: ${users.length}`)
    console.log('')

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Member Level: ${user.memberLevel}`)
      console.log(`   Points: ${user.points}`)
      console.log('')
    })

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error listing users!')
    console.error('Error:', error.message)

    await prisma.$disconnect()
    process.exit(1)
  }
}

listUsers()
