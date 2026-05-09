import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log('🔐 Creating Admin User...')
  console.log('================================')
  console.log('')

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'deaflud@admin.com' }
    })

    if (existingUser) {
      console.log('⚠️  User "deaflud" already exists!')
      console.log(`📧 Email: ${existingUser.email}`)
      console.log(`👤 Name: ${existingUser.name || 'N/A'}`)
      console.log(`🔑 Role: ${existingUser.role}`)
      console.log('')

      // Update role to admin if not already
      if (existingUser.role !== 'admin') {
        console.log('🔄 Updating role to admin...')
        const updatedUser = await prisma.user.update({
          where: { email: 'deaflud@admin.com' },
          data: { role: 'admin' }
        })
        console.log(`✅ Role updated to: ${updatedUser.role}`)
      } else {
        console.log('✅ User already has admin role')
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10)

      // Create new admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'deaflud@admin.com',
          password: hashedPassword,
          name: 'Admin Deaflud',
          phone: '081234567890',
          address: 'Jakarta, Indonesia',
          role: 'admin',
          memberLevel: 'Crazy Rich',
          points: 99999,
          notificationSound: 'chime',
          theme: 'light',
          emailNotifications: true,
          smsNotifications: true,
          language: 'id',
          termsAcceptedAt: new Date()
        }
      })

      console.log('✅ Admin user created successfully!')
      console.log('')
      console.log('📧 Email: deaflud@admin.com')
      console.log('🔑 Password: admin123')
      console.log('👤 Name: Admin Deaflud')
      console.log('🎭 Role: admin')
      console.log('⭐ Member Level: Crazy Rich')
      console.log('💎 Points: 99,999')
      console.log('')
    }

    console.log('================================')
    console.log('✅ Admin user setup complete!')
    console.log('================================')
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log('📧 Email: deaflud@admin.com')
    console.log('🔑 Password: admin123')
    console.log('')
    console.log('🌐 Local: http://localhost:3000')
    console.log('🌐 Production: https://my-project-orpin-chi-13.vercel.app')
    console.log('')
    console.log('⚠️  IMPORTANT: Change password after first login!')
    console.log('')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating admin user!')
    console.error('')
    console.error('Error details:', error.message)
    console.error('')

    if (error.code === 'P2002') {
      console.error('🔧 Troubleshooting:')
      console.error('1. User with this email already exists')
      console.error('2. Try updating existing user instead')
    }

    await prisma.$disconnect()
    process.exit(1)
  }
}

createAdminUser()
