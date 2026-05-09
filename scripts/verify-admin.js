const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyAdmin() {
  console.log('🔍 Verifying Admin User...')
  console.log('================================')
  console.log('')

  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'deaflud@admin.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found!')
    } else {
      console.log('✅ Admin user found!')
      console.log('')
      console.log('📊 User Details:')
      console.log('--------------------------------')
      console.log(`📧 Email: ${admin.email}`)
      console.log(`👤 Name: ${admin.name || 'N/A'}`)
      console.log(`🔑 Password: ${'•'.repeat(10)} (hashed)`)
      console.log(`🎭 Role: ${admin.role}`)
      console.log(`⭐ Member Level: ${admin.memberLevel}`)
      console.log(`💎 Points: ${admin.points.toLocaleString()}`)
      console.log(`📱 Phone: ${admin.phone || 'N/A'}`)
      console.log(`📍 Address: ${admin.address || 'N/A'}`)
      console.log(`🎨 Theme: ${admin.theme}`)
      console.log(`🔔 Notification Sound: ${admin.notificationSound}`)
      console.log(`🌐 Language: ${admin.language}`)
      console.log(`📧 Email Notifications: ${admin.emailNotifications ? 'Yes' : 'No'}`)
      console.log(`📱 SMS Notifications: ${admin.smsNotifications ? 'Yes' : 'No'}`)
      console.log(`✅ Terms Accepted: ${admin.termsAcceptedAt ? new Date(admin.termsAcceptedAt).toLocaleString('id-ID') : 'No'}`)
      console.log(`📅 Created At: ${new Date(admin.createdAt).toLocaleString('id-ID')}`)
      console.log('')

      // Check all admin users
      const allAdmins = await prisma.user.findMany({
        where: { role: 'admin' }
      })

      console.log('================================')
      console.log(`📋 Total Admin Users: ${allAdmins.length}`)
      console.log('================================')

      if (allAdmins.length > 0) {
        console.log('')
        console.log('👑 All Admin Users:')
        console.log('--------------------------------')
        allAdmins.forEach((adminUser, index) => {
          console.log(`${index + 1}. ${adminUser.name || adminUser.email} (${adminUser.email})`)
        })
      }

      console.log('')
      console.log('================================')
      console.log('✅ Verification complete!')
      console.log('================================')
    }

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error verifying admin user!')
    console.error('Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

verifyAdmin()
