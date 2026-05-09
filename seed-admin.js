const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ayamgeprek.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Role:', existingAdmin.role)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@ayamgeprek.com',
        password: hashedPassword,
        name: 'Admin',
        phone: '081234567890',
        address: 'Jakarta',
        role: 'admin',
        memberLevel: 'Admin',
        points: 999999,
        stampCount: 0,
        starCount: 0,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('Name:', admin.name)
    console.log('Role:', admin.role)
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
