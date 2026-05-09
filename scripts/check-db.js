const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔌 Checking Neon Database Setup...')
  console.log('================================')
  console.log('')

  try {
    // Connect
    await prisma.$connect()
    console.log('✅ Connected to Neon PostgreSQL!')
    console.log('')

    // Check tables
    console.log('📊 Database Tables:')
    console.log('--------------------------------')
    const tables = [
      { name: 'Users', count: await prisma.user.count() },
      { name: 'Products', count: await prisma.product.count() },
      { name: 'Categories', count: await prisma.category.count() },
      { name: 'Orders', count: await prisma.order.count() },
      { name: 'Vouchers', count: await prisma.voucher.count() },
      { name: 'CartItems', count: await prisma.cartItem.count() },
      { name: 'PointHistory', count: await prisma.pointHistory.count() },
      { name: 'AdminSettings', count: await prisma.adminSettings.count() },
    ]

    tables.forEach(table => {
      console.log(`📋 ${table.name.padEnd(20)} : ${table.count} records`)
    })

    console.log('')
    console.log('================================')
    console.log('✅ All tables created successfully!')
    console.log('================================')
    console.log('')
    console.log('🎉 Neon database is ready for use!')
    console.log('')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('')
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkDatabase()
