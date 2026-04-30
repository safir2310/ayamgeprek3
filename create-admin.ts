import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayamgeprek.com' },
    update: {},
    create: {
      email: 'admin@ayamgeprek.com',
      name: 'Admin Toko',
      password: hashedPassword,
      phone: '081234567890',
      address: 'Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, 24151',
      role: 'admin',
      memberLevel: 'Platinum',
      points: 1000,
      stampCount: 10,
      starCount: 5,
    },
  })

  console.log('Admin user created/updated:', admin.email)

  // Create a test customer
  const customerPassword = await bcrypt.hash('user123', 10)

  const customer = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Budi Santoso',
      password: customerPassword,
      phone: '081987654321',
      address: 'Jl. Contoh No. 123, Jakarta',
      role: 'customer',
      memberLevel: 'Gold',
      points: 500,
      stampCount: 5,
      starCount: 3,
    },
  })

  console.log('Customer user created/updated:', customer.email)

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
