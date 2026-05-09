import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Read .env file directly
const envPath = path.join(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse DATABASE_URL from .env file
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
const DATABASE_URL = databaseUrlMatch ? databaseUrlMatch[1] : ''

// Create PrismaClient with explicit database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function updatePassword() {
  try {
    console.log('🔐 Updating password for deaflud@admin.com...')
    console.log('')

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email: 'deaflud@admin.com' },
      data: { password: hashedPassword }
    })

    console.log('✅ Password updated successfully!')
    console.log('')
    console.log('📧 Email:', updatedUser.email)
    console.log('👤 Name:', updatedUser.name)
    console.log('🔑 New Password: admin123')
    console.log('')
    console.log('================================')
    console.log('🔐 Login Credentials:')
    console.log('📧 Email: deaflud@admin.com')
    console.log('🔑 Password: admin123')
    console.log('================================')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error updating password!')
    console.error('Error:', error.message)

    await prisma.$disconnect()
    process.exit(1)
  }
}

updatePassword()
