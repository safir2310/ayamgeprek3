import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✓ Database connected successfully')

    const count = await prisma.pointRedemption.count()
    console.log(`✓ Found ${count} point redemptions`)

    const redemptions = await prisma.pointRedemption.findMany({
      where: { active: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true
          }
        }
      },
      orderBy: { order: 'asc' },
      take: 2
    })
    console.log(`✓ Fetched ${redemptions.length} active redemptions`)
    console.log('Sample redemption:', JSON.stringify(redemptions[0] || null, null, 2))

    await prisma.$disconnect()
    console.log('✓ Database disconnected')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testConnection()
