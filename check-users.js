const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        role: 'asc',
      },
    })

    console.log('=== All Users in Database ===')
    console.log('Total users:', users.length)
    console.log('')

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log('')
    })

    // Check for admin users
    const adminUsers = users.filter(u => u.role === 'admin')
    console.log('=== Admin Users ===')
    console.log('Total admin users:', adminUsers.length)
    if (adminUsers.length > 0) {
      adminUsers.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`)
      })
    } else {
      console.log('No admin users found!')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
