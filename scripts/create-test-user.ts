import { db } from '../src/lib/db.ts'

async function createTestUser() {
  try {
    const user = await db.user.create({
      data: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '08123456789',
        address: 'Jl. Test No. 123',
        memberLevel: 'Bronze',
        points: 100,
        stampCount: 5,
        starCount: 2,
        role: 'customer',
        theme: 'light',
        notificationSound: 'chime',
        profilePrivate: false,
        emailNotifications: true,
        smsNotifications: false,
      },
    })

    console.log('Test user created successfully!')
    console.log('User ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)

    return user
  } catch (error) {
    console.error('Error creating test user:', error)
    throw error
  }
}

createTestUser()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
