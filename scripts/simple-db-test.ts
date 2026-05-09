import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔌 Testing database connection...')
  console.log('================================')

  try {
    // Test 1: Connect to database
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    console.log('')

    // Test 2: Check database info
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

    const categoryCount = await prisma.category.count()
    console.log(`📁 Total categories: ${categoryCount}`)

    const adminSettings = await prisma.adminSettings.findFirst()
    if (adminSettings) {
      console.log(`⚙️  Admin settings: ${adminSettings.storeName}`)
    } else {
      console.log(`⚙️  No admin settings found`)
    }

    console.log('')
    console.log('================================')
    console.log('✅ All tests passed!')
    console.log('================================')
    console.log('')
    console.log('🎉 Your Neon database is ready for use!')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Database connection failed!')
    console.error('')
    console.error('Error details:', error.message)
    console.error('')

    if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Troubleshooting:')
      console.error('1. Check your .env file for correct DATABASE_URL')
      console.error('2. Ensure Neon database is running')
      console.error('3. Check internet connection')
    } else if (error.message.includes('authentication')) {
      console.error('🔧 Troubleshooting:')
      console.error('1. Check database credentials in .env')
      console.error('2. Verify password is correct')
    } else if (error.message.includes('timeout')) {
      console.error('🔧 Troubleshooting:')
      console.error('1. Check internet connection')
      console.error('2. Try again in a few moments')
      console.error('3. Check Neon console for database status')
    } else {
      console.error('🔧 Troubleshooting:')
      console.error('1. Check your .env file')
      console.error('2. Ensure Prisma Client is generated')
      console.error('3. Review Prisma schema')
    }

    console.error('')
    console.error('📚 For help, visit: https://neon.tech/docs')
    console.error('')

    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
