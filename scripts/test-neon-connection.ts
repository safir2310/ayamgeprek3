import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔌 Testing database connection...')
  console.log('================================')

  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    console.log('')

    // Test basic queries
    console.log('📊 Testing database queries...')
    console.log('--------------------------------')

    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)

    const productCount = await prisma.product.count()
    console.log(`📦 Total products: ${productCount}`)

    const orderCount = await prisma.order.count()
    console.log(`📋 Total orders: ${orderCount}`)

    const voucherCount = await prisma.voucher.count()
    console.log(`🎟️  Total vouchers: ${voucherCount}`)

    console.log('')
    console.log('================================')
    console.log('✅ All tests passed!')
    console.log('================================')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Database connection failed!')
    console.error('')
    console.error('Error details:', error.message)
    console.error('')
    console.error('🔧 Troubleshooting:')
    console.error('1. Check your .env file for correct DATABASE_URL')
    console.error('2. Ensure Neon database is running')
    console.error('3. Verify your IP is allowed (if using IP allowlist)')
    console.error('4. Check if SSL mode is enabled (sslmode=require)')
    console.error('')
    console.error('📚 For help, visit: https://neon.tech/docs')
    console.error('')

    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
